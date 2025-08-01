// workers/whisperWorker.ts

self.onmessage = async (e: MessageEvent) => {
  const { type, audioBlob } = e.data;

  if (type === "TRANSCRIBE" && audioBlob) {
    // You could call Whisper API here or use a real model
    // For now, mock the transcription
    setTimeout(() => {
      self.postMessage({
        type: "transcript",
        data: "Mocked transcription from recorded audio.",
      });
    }, 1000);
  }
};
