// =============================================================================
// ELYWYD — Optional audio engine.
// -----------------------------------------------------------------------------
// Placeholder, ORIGINAL synthesized sound (no recognizable platform sounds).
// Arc: quiet ambience -> sparse blips -> layered distortion -> abrupt silence.
//
// - No sound until start() is called (from a user gesture: BEGIN).
// - Fully optional: if WebAudio is unavailable or an asset fails, the whole
//   experience still works. Every call is guarded.
// - An optional instrumental (config.AUDIO.instrumentalSrc) is lazy-loaded and
//   layered under the ambience if present; missing files are handled silently.
// =============================================================================

import { AUDIO, Phase } from "./config";

type Ctx = AudioContext;

export class SimAudio {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private drone: OscillatorNode | null = null;
  private sub: OscillatorNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private distortionGain: GainNode | null = null;
  private music: HTMLAudioElement | null = null;
  private muted = false;
  private started = false;

  get isStarted(): boolean {
    return this.started;
  }

  /** Create the audio graph. Call from a user gesture. Safe to call once. */
  start(): void {
    if (this.started) return;
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.9;
      master.connect(ctx.destination);
      this.master = master;

      // Ambient bed: a low drone + faint sub, kept quiet.
      const ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.0;
      ambientGain.connect(master);
      this.ambientGain = ambientGain;

      const drone = ctx.createOscillator();
      drone.type = "sine";
      drone.frequency.value = 55;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.5;
      drone.connect(droneGain).connect(ambientGain);
      drone.start();
      this.drone = drone;

      const sub = ctx.createOscillator();
      sub.type = "triangle";
      sub.frequency.value = 82.4;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.18;
      sub.connect(subGain).connect(ambientGain);
      sub.start();
      this.sub = sub;

      // Distortion/noise layer used later in the arc.
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.0;
      noiseGain.connect(master);
      this.noiseGain = noiseGain;
      const distortionGain = ctx.createGain();
      distortionGain.gain.value = 0.0;
      distortionGain.connect(master);
      this.distortionGain = distortionGain;

      const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 900;
      bp.Q.value = 0.7;
      noise.connect(bp).connect(noiseGain);
      noise.start();
      this.noise = noise;

      // Fade ambience in.
      const now = ctx.currentTime;
      ambientGain.gain.linearRampToValueAtTime(0.12, now + 1.2);

      // Optional instrumental — lazy, best-effort.
      this.loadInstrumental();

      this.started = true;
    } catch {
      // Audio is entirely optional; ignore failures.
      this.started = true;
    }
  }

  private loadInstrumental(): void {
    if (!AUDIO.instrumentalSrc) return;
    try {
      const el = new Audio();
      el.src = AUDIO.instrumentalSrc;
      el.loop = true;
      el.preload = "auto";
      el.volume = this.muted ? 0 : 0.5;
      // If the file is missing, this errors quietly and we simply skip it.
      el.addEventListener("error", () => {
        this.music = null;
      });
      el.play().catch(() => {
        /* autoplay/asset failure is fine */
      });
      this.music = el;
    } catch {
      this.music = null;
    }
  }

  /** Short, original notification tick. No-op if audio isn't running. */
  blip(intensity = 1): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "square";
      const base = 520 + Math.random() * 160;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.09);
      const g = ctx.createGain();
      const peak = 0.05 * intensity;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(g).connect(this.master);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      /* ignore */
    }
  }

  /** Move the ambience to match the current phase intensity. */
  setPhase(phase: Phase): void {
    const ctx = this.ctx;
    if (!ctx || !this.ambientGain || !this.noiseGain || !this.distortionGain)
      return;
    const now = ctx.currentTime;
    const ramp = (node: GainNode, v: number, t: number) => {
      try {
        node.gain.cancelScheduledValues(now);
        node.gain.setValueAtTime(node.gain.value, now);
        node.gain.linearRampToValueAtTime(v, now + t);
      } catch {
        /* ignore */
      }
    };
    switch (phase) {
      case "identification":
      case "alive":
        ramp(this.ambientGain, 0.12, 0.6);
        ramp(this.noiseGain, 0.0, 0.4);
        ramp(this.distortionGain, 0.0, 0.4);
        break;
      case "statusChange":
        ramp(this.ambientGain, 0.05, 0.2);
        ramp(this.noiseGain, 0.08, 0.15);
        break;
      case "initialReaction":
        ramp(this.ambientGain, 0.14, 0.6);
        ramp(this.noiseGain, 0.02, 0.6);
        break;
      case "viral":
        ramp(this.ambientGain, 0.16, 1.0);
        ramp(this.noiseGain, 0.06, 1.0);
        ramp(this.distortionGain, 0.03, 1.0);
        break;
      case "content":
        ramp(this.ambientGain, 0.18, 1.0);
        ramp(this.noiseGain, 0.14, 1.0);
        ramp(this.distortionGain, 0.1, 1.0);
        break;
      case "collapse":
      case "ending":
        // Abrupt silence before the ending.
        ramp(this.ambientGain, 0.0, 0.12);
        ramp(this.noiseGain, 0.0, 0.12);
        ramp(this.distortionGain, 0.0, 0.12);
        if (this.music) {
          try {
            this.music.pause();
          } catch {
            /* ignore */
          }
        }
        break;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      try {
        this.master.gain.setValueAtTime(muted ? 0 : 0.9, this.ctx.currentTime);
      } catch {
        /* ignore */
      }
    }
    if (this.music) this.music.volume = muted ? 0 : 0.5;
  }

  /** Tear down all nodes and free resources. */
  destroy(): void {
    try {
      this.drone?.stop();
      this.sub?.stop();
      this.noise?.stop();
    } catch {
      /* ignore */
    }
    if (this.music) {
      try {
        this.music.pause();
        this.music.src = "";
      } catch {
        /* ignore */
      }
    }
    try {
      this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
    this.master = null;
    this.ambientGain = null;
    this.noiseGain = null;
    this.distortionGain = null;
    this.drone = null;
    this.sub = null;
    this.noise = null;
    this.music = null;
    this.started = false;
  }
}
