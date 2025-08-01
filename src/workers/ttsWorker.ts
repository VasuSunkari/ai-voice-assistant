// ttsWorker.ts
self.onmessage = (e) => {
  const { text } = e.data;

  const synth = globalThis.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";

  synth.speak(utter);

  // Just indicate completion
  self.postMessage({ audioUrl: "" });
};
