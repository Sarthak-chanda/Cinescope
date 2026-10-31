// Lightweight Synthesized Sound Effects Engine (Native Web Audio API - Zero external assets)
let audioCtx = null;
let masterGain = null;
let isMuted = false;

const initAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      try {
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      } catch {
        masterGain = null;
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Auto-warm AudioContext on earliest user gesture for zero-latency audio
if (typeof window !== 'undefined') {
  const warmAudio = () => {
    const ctx = initAudio();
    if (ctx && ctx.state === 'running') {
      ['pointerdown', 'touchstart', 'keydown'].forEach((e) =>
        window.removeEventListener(e, warmAudio)
      );
    }
  };
  ['pointerdown', 'touchstart', 'keydown'].forEach((e) =>
    window.addEventListener(e, warmAudio, { passive: true, once: true })
  );
}

export const toggleAudioMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

export const getAudioMuted = () => isMuted;

export const playSound = (type = 'click') => {
  if (isMuted) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const executeSound = () => {
      const now = ctx.currentTime;
      const dest = masterGain || ctx.destination;

      if (type === 'click') {
        // Crisp, punchy UI click (reduced latency & decay)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'star') {
        // Sparkling Harp Chime for rating
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t = now + idx * 0.045;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.32);
        });
      } else if (type === 'whoosh') {
        // Subtle Cinematic Whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.22);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'fanfare') {
        // Celebratory 10/10 Masterpiece Fanfare
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.07;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 0.48);
        });
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(executeSound).catch(() => {});
    } else {
      executeSound();
    }
  } catch {
    // Gracefully ignore audio failures (e.g. browser policy)
  }
};
