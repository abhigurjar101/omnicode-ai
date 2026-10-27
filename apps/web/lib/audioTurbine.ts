"use client";

class TurbineAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscLow: OscillatorNode | null = null;
  private oscMid: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isRunning: boolean = false;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
    this.filter.connect(this.masterGain);

    // Deep sub-drone
    this.oscLow = this.ctx.createOscillator();
    this.oscLow.type = "sine";
    this.oscLow.frequency.setValueAtTime(58, this.ctx.currentTime);
    this.oscLow.connect(this.filter);

    // Turbine mid-harmonic
    this.oscMid = this.ctx.createOscillator();
    this.oscMid.type = "triangle";
    this.oscMid.frequency.setValueAtTime(116, this.ctx.currentTime);
    this.oscMid.connect(this.filter);

    this.oscLow.start();
    this.oscMid.start();
  }

  public toggle(): boolean {
    this.init();
    if (!this.ctx || !this.masterGain) return false;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isRunning) {
      // Fade out
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
      this.isRunning = false;
    } else {
      // Fade in
      this.masterGain.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.2);
      this.isRunning = true;
    }

    return this.isRunning;
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

export const turbineAudio = new TurbineAudio();
