/**
 * LUMINA: SACRED AUDIO ENGINE
 * Procedural generation of Binaural Beats, Ambient Layers, and Soundscapes
 */

class SacredAudioEngine {
  constructor() {
    this.context = null;
    this.leftOsc = null;
    this.rightOsc = null;
    this.merger = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.noiseGain = null;
    this.isPlaying = false;
    this.masterVolume = 0.3;
    this._stopTimeoutId = null;

    // Layer system
    this.layers = {
      rain: { gain: null, source: null, active: false, volume: 0 },
      bowls: { gain: null, oscillators: [], active: false, volume: 0 },
      pads: { gain: null, oscillators: [], active: false, volume: 0 },
    };
  }

  init() {
    if (this.context) return;
    this.context = new (window.AudioContext || window.webkitAudioContext)();

    // Master Gain
    this.gainNode = this.context.createGain();
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
    this.gainNode.connect(this.context.destination);

    // Filter for Brown Noise
    this.noiseGain = this.context.createGain();
    this.noiseGain.gain.setValueAtTime(0.05, this.context.currentTime);
    this.noiseGain.connect(this.gainNode);
  }

  createBrownNoise() {
    const bufferSize = 4096;
    let lastOut = 0.0;
    const node = this.context.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    };
    return node;
  }

  /* ----------------------------------------------------------------------- */
  /*  PROCEDURAL LAYER GENERATORS                                            */
  /* ----------------------------------------------------------------------- */

  /**
   * Rain — filtered white noise with amplitude modulation for droplet texture
   */
  _createRain(volume = 0.15) {
    if (!this.context) return null;

    const bufferSize = 4096;
    const noiseNode = this.context.createScriptProcessor(bufferSize, 1, 1);
    const rainGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    // Bandpass filter to shape rain character
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    rainGain.gain.setValueAtTime(volume, this.context.currentTime);

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // White noise with slow amplitude modulation for droplet feel
        const mod = 0.7 + 0.3 * Math.sin(i * 0.001 * Math.PI * 2);
        output[i] = (Math.random() * 2 - 1) * mod;
      }
    };

    noiseNode.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.gainNode);

    return { noiseNode, rainGain };
  }

  /**
   * Tibetan Bowls — harmonic sine oscillators at bowl-like intervals
   */
  _createBowls(volume = 0.08) {
    if (!this.context) return null;

    // Bowl harmonics: fundamental + overtones at musical intervals
    const frequencies = [220, 330, 440, 554.37, 660]; // A3 + harmonics
    const bowlGain = this.context.createGain();
    bowlGain.gain.setValueAtTime(0, this.context.currentTime);
    bowlGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 3);
    bowlGain.connect(this.gainNode);

    const oscillators = frequencies.map((freq) => {
      const osc = this.context.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.context.currentTime);
      // Slow detune for organic shimmer
      osc.detune.setValueAtTime(Math.random() * 6 - 3, this.context.currentTime);
      osc.connect(bowlGain);
      osc.start();
      return osc;
    });

    return { bowlGain, oscillators };
  }

  /**
   * Ambient Pads — soft, warm drone at chord tones
   */
  _createPads(volume = 0.06) {
    if (!this.context) return null;

    // Warm pad chord: C3, E3, G3, B3 (Cmaj7 voicing)
    const frequencies = [130.81, 164.81, 196.00, 246.94];
    const padGain = this.context.createGain();
    padGain.gain.setValueAtTime(0, this.context.currentTime);
    padGain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 4);
    padGain.connect(this.gainNode);

    const oscillators = frequencies.map((freq) => {
      const osc = this.context.createOscillator();
      osc.type = 'triangle'; // Warm triangle waves
      osc.frequency.setValueAtTime(freq, this.context.currentTime);
      // Subtle vibrato
      const lfo = this.context.createOscillator();
      lfo.frequency.value = 0.3;
      const lfoGain = this.context.createGain();
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      osc.connect(padGain);
      osc.start();
      return { osc, lfo };
    });

    return { padGain, oscillators };
  }

  /* ----------------------------------------------------------------------- */
  /*  LAYER API                                                              */
  /* ----------------------------------------------------------------------- */

  /**
   * Activate a sound layer.
   * @param {'rain'|'bowls'|'pads'} layerId
   * @param {number} volume — 0 to 1
   */
  startLayer(layerId, volume = 0.15) {
    this.init();
    const layer = this.layers[layerId];
    if (!layer || layer.active) return;

    let result;
    switch (layerId) {
      case 'rain':
        result = this._createRain(volume);
        if (result) {
          layer.source = result.noiseNode;
          layer.gain = result.rainGain;
        }
        break;
      case 'bowls':
        result = this._createBowls(volume);
        if (result) {
          layer.oscillators = result.oscillators;
          layer.gain = result.bowlGain;
        }
        break;
      case 'pads':
        result = this._createPads(volume);
        if (result) {
          layer.oscillators = result.oscillators.map(o => o.osc);
          layer.gain = result.padGain;
        }
        break;
    }

    if (result) layer.active = true;
    layer.volume = volume;
  }

  /**
   * Deactivate a sound layer with smooth fade-out.
   */
  stopLayer(layerId) {
    const layer = this.layers[layerId];
    if (!layer || !layer.active) return;

    // Fade out
    if (layer.gain && this.context) {
      layer.gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
    }

    setTimeout(() => {
      // Stop oscillators if any
      layer.oscillators.forEach(osc => {
        try {
          if (osc.osc) osc.osc.stop(); // Pad: { osc, lfo }
          else osc.stop();
        } catch (_) {}
      });
      // Stop noise source
      if (layer.source) {
        try { layer.source.disconnect(); } catch (_) {}
        layer.source = null;
      }
      if (layer.gain) {
        try { layer.gain.disconnect(); } catch (_) {}
        layer.gain = null;
      }
      layer.oscillators = [];
      layer.active = false;
      layer.volume = 0;
    }, 1100);
  }

  /**
   * Set the volume of an active layer.
   */
  setLayerVolume(layerId, volume) {
    const layer = this.layers[layerId];
    if (!layer || !layer.active || !layer.gain || !this.context) return;

    layer.volume = volume;
    layer.gain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1);
  }

  /**
   * Get the current state of all layers.
   */
  getLayerStates() {
    return Object.fromEntries(
      Object.entries(this.layers).map(([id, layer]) => [
        id,
        { active: layer.active, volume: layer.volume },
      ])
    );
  }

  /* ----------------------------------------------------------------------- */
  /*  CORE BINAURAL PLAY / STOP                                              */
  /* ----------------------------------------------------------------------- */

  play(mode = 'Alpha') {
    this.init();
    if (this.isPlaying) return;

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    if (this._stopTimeoutId) {
      clearTimeout(this._stopTimeoutId);
      this._stopTimeoutId = null;
    }

    this.isPlaying = true;
    const baseFreq = 200;
    let delta = 10;

    switch(mode) {
      case 'Theta': delta = 6; break;
      case 'Alpha': delta = 10; break;
      case 'Gamma': delta = 40; break;
      case 'Zen': delta = 1.5; break;
    }

    if (this.merger) {
      try { this.merger.disconnect(); } catch (_) {}
    }

    this.leftOsc = this.context.createOscillator();
    this.rightOsc = this.context.createOscillator();
    this.merger = this.context.createChannelMerger(2);

    this.leftOsc.frequency.setValueAtTime(baseFreq, this.context.currentTime);
    this.rightOsc.frequency.setValueAtTime(baseFreq + delta, this.context.currentTime);

    this.leftOsc.connect(this.merger, 0, 0);
    this.rightOsc.connect(this.merger, 0, 1);
    this.merger.connect(this.gainNode);

    if (this.noiseNode) {
      try { this.noiseNode.disconnect(); } catch (_) {}
    }
    this.noiseNode = this.createBrownNoise();
    this.noiseNode.connect(this.noiseGain);

    this.leftOsc.start();
    this.rightOsc.start();

    this.gainNode.gain.linearRampToValueAtTime(this.masterVolume, this.context.currentTime + 2);
  }

  stop() {
    if (!this.isPlaying) return;
    this.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
    if (this._stopTimeoutId) {
      clearTimeout(this._stopTimeoutId);
    }
    this._stopTimeoutId = setTimeout(() => {
      if (this.leftOsc) { this.leftOsc.stop(); this.leftOsc = null; }
      if (this.rightOsc) { this.rightOsc.stop(); this.rightOsc = null; }
      if (this.noiseNode) { this.noiseNode.disconnect(); this.noiseNode = null; }
      if (this.merger) { try { this.merger.disconnect(); } catch (_) {} this.merger = null; }
      this.isPlaying = false;
      this._stopTimeoutId = null;
    }, 1100);
  }

  setVolume(val) {
    this.masterVolume = val;
    if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(val, this.context.currentTime, 0.1);
    }
  }
}

export const audioEngine = new SacredAudioEngine();
