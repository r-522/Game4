'use client';

type SoundChannel = 'bgm' | 'sfx';

interface AudioTrack {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
}

let ctx: AudioContext | null = null;
let bgmTrack: AudioTrack | null = null;
let masterVolume = 0.5;
let isMuted = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return ctx;
}

function createNoteSequence(
  frequencies: number[],
  durations: number[],
  waveType: OscillatorType = 'sawtooth',
  volume = 0.15,
  loop = true
): AudioTrack {
  const audioCtx = getCtx();
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = isMuted ? 0 : volume * masterVolume;
  gainNode.connect(audioCtx.destination);

  const oscillators: OscillatorNode[] = [];
  let time = audioCtx.currentTime;
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  const playSequence = (startTime: number) => {
    let t = startTime;
    frequencies.forEach((freq, i) => {
      if (freq > 0) {
        const osc = audioCtx.createOscillator();
        osc.type = waveType;
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start(t);
        osc.stop(t + durations[i] - 0.02);
        oscillators.push(osc);
      }
      t += durations[i];
    });
    if (loop) {
      setTimeout(() => {
        if (!isMuted) playSequence(audioCtx.currentTime);
      }, totalDuration * 1000);
    }
  };

  playSequence(time);
  return { oscillators, gainNode };
}

const BGM_TRACKS: Record<string, () => AudioTrack> = {
  chapter1_theme: () => createNoteSequence(
    [220, 262, 294, 262, 220, 196, 220, 262, 294, 330, 294, 262, 220, 0],
    [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.2],
    'sawtooth', 0.12, true
  ),
  chapter2_theme: () => createNoteSequence(
    [262, 294, 330, 262, 294, 349, 330, 294],
    [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.8],
    'square', 0.1, true
  ),
  chapter3_theme: () => createNoteSequence(
    [196, 220, 247, 196, 175, 196, 220, 247, 262, 220],
    [0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3],
    'sawtooth', 0.13, true
  ),
  chapter4_theme: () => createNoteSequence(
    [147, 165, 175, 165, 147, 131, 147, 165, 196, 175, 165, 147],
    [0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5],
    'sawtooth', 0.14, true
  ),
  final_battle_theme: () => createNoteSequence(
    [330, 294, 330, 349, 330, 294, 262, 294, 330, 392, 349, 330],
    [0.2, 0.2, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.2, 0.6],
    'sawtooth', 0.15, true
  ),
  battle_theme: () => createNoteSequence(
    [440, 494, 523, 494, 440, 415, 440, 494, 440, 392, 415, 440],
    [0.15, 0.15, 0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.15, 0.15, 0.15, 0.3],
    'square', 0.13, true
  ),
};

export function playBgm(track: string): void {
  stopBgm();
  if (isMuted) return;
  const factory = BGM_TRACKS[track];
  if (factory) {
    bgmTrack = factory();
  }
}

export function stopBgm(): void {
  if (bgmTrack) {
    bgmTrack.gainNode.gain.setTargetAtTime(0, getCtx().currentTime, 0.1);
    bgmTrack = null;
  }
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
  if (bgmTrack) {
    bgmTrack.gainNode.gain.value = muted ? 0 : masterVolume * 0.15;
  }
  if (muted) stopBgm();
}

function playOneShotTone(
  frequency: number,
  duration: number,
  waveType: OscillatorType = 'square',
  vol = 0.3
): void {
  if (isMuted) return;
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = waveType;
  osc.frequency.value = frequency;
  gain.gain.value = vol * masterVolume;
  gain.gain.setTargetAtTime(0, audioCtx.currentTime + duration * 0.7, duration * 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export const SFX: Record<string, () => void> = {
  punch_light: () => {
    playOneShotTone(150, 0.08, 'square', 0.4);
    playOneShotTone(100, 0.1, 'sawtooth', 0.3);
  },
  punch_heavy: () => {
    playOneShotTone(80, 0.15, 'sawtooth', 0.5);
    playOneShotTone(60, 0.2, 'square', 0.4);
  },
  punch_special: () => {
    [440, 880, 1760].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.1, 'square', 0.4), i * 50);
    });
  },
  block: () => playOneShotTone(300, 0.1, 'square', 0.3),
  dodge: () => playOneShotTone(600, 0.05, 'sine', 0.2),
  hit: () => {
    playOneShotTone(200, 0.12, 'sawtooth', 0.35);
  },
  victory: () => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.3, 'square', 0.4), i * 150);
    });
  },
  defeat: () => {
    [400, 350, 300, 250].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.3, 'sawtooth', 0.3), i * 200);
    });
  },
  menchi_win: () => {
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.15, 'square', 0.35), i * 100);
    });
  },
  menchi_lose: () => playOneShotTone(200, 0.3, 'sawtooth', 0.3),
  level_up: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.2, 'square', 0.4), i * 100);
    });
  },
  friendship: () => {
    [523, 587, 659, 784].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.2, 'sine', 0.3), i * 80);
    });
  },
  menu_select: () => playOneShotTone(800, 0.05, 'sine', 0.2),
  menu_confirm: () => {
    playOneShotTone(600, 0.08, 'sine', 0.25);
    setTimeout(() => playOneShotTone(800, 0.1, 'sine', 0.25), 80);
  },
  taunt: () => {
    [200, 300, 400].forEach((f, i) => {
      setTimeout(() => playOneShotTone(f, 0.1, 'square', 0.3), i * 60);
    });
  },
};

export function playSfx(name: string): void {
  SFX[name]?.();
}
