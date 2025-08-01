'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [recording, setRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const whisperWorker = useRef<Worker | null>(null);
  const ttsWorker = useRef<Worker | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  useEffect(() => {
    // Initialize Whisper Worker
    whisperWorker.current = new Worker(
      new URL('../workers/whisperWorker.ts', import.meta.url),
      { type: 'module' }
    );

    whisperWorker.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'transcript') {
        console.log('🎙️ User Input Transcript:', data);
        setTranscript(data);
        sendToLLM(data);
      }
    };

    // Initialize TTS Worker
    ttsWorker.current = new Worker(
      new URL('../workers/ttsWorker.ts', import.meta.url),
      { type: 'module' }
    );

    ttsWorker.current.onmessage = (e) => {
      const { audioUrl } = e.data;
      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    };

    return () => {
      whisperWorker.current?.terminate();
      ttsWorker.current?.terminate();
    };
  }, []);

  const sendToLLM = async (text: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript: text }),
    });

    const data = await res.json();
    setReply(data.message);
    ttsWorker.current?.postMessage({ text: data.message });
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
      whisperWorker.current?.postMessage({ type: 'TRANSCRIBE', audioBlob });
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-2xl w-full text-white">
        <h1 className="text-4xl font-bold mb-6 text-center">🧠 AI Voice Assistant</h1>

        <div className="flex justify-center space-x-4 mb-6">
          {!recording ? (
            <button
              onClick={startRecording}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-white font-medium transition"
            >
              🎤 Start
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg text-white font-medium transition"
            >
              ⏹ Stop
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-lg">
            <span className="font-semibold text-white/70">🗣 Transcript:</span>{' '}
            <span className="text-white">{transcript}</span>
          </p>
          <p className="text-lg mt-2">
            <span className="font-semibold text-white/70">🤖 Reply:</span>{' '}
            <span className="text-white">{reply}</span>
          </p>
        </div>

        <audio
          ref={audioRef}
          controls
          className="w-full mt-4 rounded-xl bg-white/20 backdrop-blur-sm"
        />
      </div>
    </main>
  );
}
