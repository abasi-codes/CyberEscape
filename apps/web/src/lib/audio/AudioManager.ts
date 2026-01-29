export type SFXType =
  | 'click'
  | 'correct'
  | 'incorrect'
  | 'hint-reveal'
  | 'warning-beep'
  | 'alarm'
  | 'heartbeat'
  | 'victory'
  | 'failure'
  | 'confetti-pop';

export type AmbientType =
  | 'cyber-loop'
  | 'terminal-hum'
  | 'email-office'
  | 'data-center'
  | 'network-buzz'
  | 'quiet-tension'
  | 'alert-room';

const SFX_PATHS: Record<SFXType, string> = {
  'click': '/audio/sfx/click.mp3',
  'correct': '/audio/sfx/correct.mp3',
  'incorrect': '/audio/sfx/incorrect.mp3',
  'hint-reveal': '/audio/sfx/hint-reveal.mp3',
  'warning-beep': '/audio/sfx/warning-beep.mp3',
  'alarm': '/audio/sfx/alarm.mp3',
  'heartbeat': '/audio/sfx/heartbeat.mp3',
  'victory': '/audio/sfx/victory.mp3',
  'failure': '/audio/sfx/failure.mp3',
  'confetti-pop': '/audio/sfx/confetti-pop.mp3',
};

const AMBIENT_PATHS: Record<AmbientType, string> = {
  'cyber-loop': '/audio/ambient/cyber-loop.mp3',
  'terminal-hum': '/audio/ambient/terminal-hum.mp3',
  'email-office': '/audio/ambient/email-office.mp3',
  'data-center': '/audio/ambient/data-center.mp3',
  'network-buzz': '/audio/ambient/network-buzz.mp3',
  'quiet-tension': '/audio/ambient/quiet-tension.mp3',
  'alert-room': '/audio/ambient/alert-room.mp3',
};

class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private currentAmbient: AudioBufferSourceNode | null = null;
  private currentAmbientType: AmbientType | null = null;
  private muted = false;
  private initialized = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.ambientGain = this.audioContext.createGain();

      this.sfxGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.masterGain.gain.value = 0.7;
      this.sfxGain.gain.value = 0.8;
      this.ambientGain.gain.value = 0.5;

      this.initialized = true;
    } catch (error) {
      console.warn('AudioManager: Web Audio API not available', error);
    }
  }

  private async loadBuffer(path: string): Promise<AudioBuffer | null> {
    if (this.audioBuffers.has(path)) {
      return this.audioBuffers.get(path)!;
    }

    if (!this.audioContext) return null;

    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`AudioManager: Could not load ${path}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(path, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`AudioManager: Error loading ${path}`, error);
      return null;
    }
  }

  async playSFX(type: SFXType): Promise<void> {
    if (this.muted || !this.audioContext || !this.sfxGain) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const path = SFX_PATHS[type];
    const buffer = await this.loadBuffer(path);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.sfxGain);
    source.start(0);
  }

  async playAmbient(type: AmbientType): Promise<void> {
    if (!this.audioContext || !this.ambientGain) return;

    // Don't restart if already playing the same ambient
    if (this.currentAmbientType === type && this.currentAmbient) return;

    // Stop current ambient
    this.stopAmbient();

    if (this.muted) {
      this.currentAmbientType = type;
      return;
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const path = AMBIENT_PATHS[type];
    const buffer = await this.loadBuffer(path);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.ambientGain);
    source.start(0);

    this.currentAmbient = source;
    this.currentAmbientType = type;
  }

  stopAmbient(): void {
    if (this.currentAmbient) {
      try {
        this.currentAmbient.stop();
      } catch {}
      this.currentAmbient = null;
    }
    this.currentAmbientType = null;
  }

  setMasterVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  setSfxVolume(value: number): void {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  setAmbientVolume(value: number): void {
    if (this.ambientGain) {
      this.ambientGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAmbient();
    } else if (this.currentAmbientType) {
      // Restart ambient if we have a type queued
      const type = this.currentAmbientType;
      this.currentAmbientType = null;
      this.playAmbient(type);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  // Preload common sounds for instant playback
  async preloadSounds(types: SFXType[]): Promise<void> {
    await Promise.all(types.map(type => this.loadBuffer(SFX_PATHS[type])));
  }
}

export const audioManager = AudioManager.getInstance();
