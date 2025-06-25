export const speakOut = (text, mood) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = mood === "positive" ? 1.2 : mood === "negative" ? 0.8 : 1;
    utterance.voice = window.speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  };
  