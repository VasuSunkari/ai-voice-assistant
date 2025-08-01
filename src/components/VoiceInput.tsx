// components/VoiceInput.tsx

'use client';

import React, { useRef, useState, useEffect } from 'react';

export default function VoiceInput() {
  const whisperWorkerRef = useRef<Worker | null>(null);
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    whisperWorkerRef.current = new Worker(
      new URL('../workers/whisperWorker.ts', import.meta.url)
    );

    whisperWorkerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'transcript') {
        setTranscript(data);
        speakText(data); // TTS
      }
    };

    return () => {
      whisperWorkerRef.current?.terminate();
    };
  }, []);

  const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      whisperWorkerRef.current?.postMessage({
        type: 'TRANSCRIBE',
        audioBlob: audioBlob,
      });
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">🎙️ Voice Input</h2>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop Recording
          </button>
        )}
      </div>
      <p className="mt-4 text-gray-800">📝 Transcript: {transcript}</p>
    </div>
  );
}
