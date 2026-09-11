const voiceManager = {
  enabled: localStorage.getItem('kallari-voice-enabled') !== 'false',
  unlocked: false,
  voice: null,
  status: 'INITIALIZING',
  currentLine: '',
  currentEmotion: 'calm',
  lastSpokenAt: 0,
  cooldown: 2200,

  updateStatusLabel() {
    const label = document.getElementById('voiceStatus');
    if (label) label.textContent = this.status;
  },

  init() {
    if (!('speechSynthesis' in window)) { this.status = 'UNAVAILABLE'; this.updateStatusLabel(); return; }
    this.refreshVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () => this.refreshVoices());
  },

  refreshVoices() {
    const voices = window.speechSynthesis.getVoices();
    this.voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith('ml')) || null;
    this.status = this.voice ? 'READY: ml-IN' : 'NO MALAYALAM VOICE';
    this.updateStatusLabel();
  },

  unlock() { this.unlocked = true; this.refreshVoices(); },

  speak(dialogue, force = false) {
    this.currentLine = dialogue.text;
    this.currentEmotion = dialogue.emotion;
    if (!this.unlocked || !this.enabled || !this.voice || (!force && performance.now() - this.lastSpokenAt < this.cooldown)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(dialogue.text);
    utterance.voice = this.voice;
    utterance.lang = this.voice.lang;
    utterance.rate = { calm: 0.86, friendly: 0.95, mocking: 1.04, annoyed: 1.08, angry: 1.12, furious: 1.18, dramatic: 0.9, excited: 1.05 }[dialogue.emotion] || 1;
    utterance.pitch = dialogue.emotion === 'furious' || dialogue.emotion === 'angry' ? 0.78 : 0.9;
    utterance.volume = 0.9;
    utterance.onstart = () => { this.status = `SPEAKING: ${this.voice.lang}`; this.updateStatusLabel(); };
    utterance.onend = () => { this.status = `READY: ${this.voice.lang}`; this.updateStatusLabel(); };
    utterance.onerror = () => { this.status = 'VOICE ERROR'; this.updateStatusLabel(); };
    this.lastSpokenAt = performance.now();
    window.speechSynthesis.speak(utterance);
  },

  stop() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('kallari-voice-enabled', String(this.enabled));
    if (!this.enabled) this.stop();
  }
};

voiceManager.init();