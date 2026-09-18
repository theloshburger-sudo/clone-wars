(function () {
  let audio = null;
  function getAudio() {
    if (!audio) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audio = new AudioCtx();
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  function flap() {
    try {
      const context = getAudio();
      if (!context) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(92, now);
      oscillator.frequency.exponentialRampToValueAtTime(58, now + 0.18);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.23);
    } catch (error) {}
  }

  function score() {
    try {
      const context = getAudio();
      if (!context) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.setValueAtTime(1320, now + 0.045);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.13);
    } catch (error) {}
  }

  function crash() {
    try {
      const context = getAudio();
      if (!context) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(105, now);
      oscillator.frequency.exponentialRampToValueAtTime(32, now + 0.36);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.43);
    } catch (error) {}
  }

  window.SOUNDS = { flap, score, crash };
})();
