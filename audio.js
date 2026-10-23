/**
 * INTERSTELLAR BGM ENGINE
 * Synthesizes Hans Zimmer's iconic "Cornfield Chase" / "First Step" church organ score
 * in real-time via Web Audio API, completely offline and royalty-free, with zero latency.
 */

class InterstellarAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.tempo = 128; // BPM
        this.timer = null;
        this.step = 0;
        this.volume = 0.75;
        this.onVisualizerTick = null;

        // Frequencies for the Hans Zimmer Interstellar motif (A minor / D minor progression)
        this.notes = {
            // Bass
            'A1': 55.00, 'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00,
            'A2': 110.00, 'B2': 123.47, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00,
            // Chords & Melody
            'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
            'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
            'A5': 880.00
        };

        // Iconic Cornfield Chase Arpeggio progression (Am -> F -> C -> G -> Dm -> Am)
        // Each measure has 16 sixteenth notes
        this.patterns = [
            // Measure 1: Am (A, E, A, C, E, A, C, E...)
            { chord: ['A1', 'A2', 'E3'], arp: ['E4', 'A4', 'C5', 'E5', 'A4', 'C5', 'E5', 'C5', 'E4', 'A4', 'C5', 'E5', 'A4', 'C5', 'E5', 'C5'] },
            // Measure 2: G (G, D, G, B, D, G, B, D...)
            { chord: ['G1', 'G2', 'D3'], arp: ['D4', 'G4', 'B4', 'D5', 'G4', 'B4', 'D5', 'B4', 'D4', 'G4', 'B4', 'D5', 'G4', 'B4', 'D5', 'B4'] },
            // Measure 3: F (F, C, F, A, C, F, A, C...)
            { chord: ['F1', 'F2', 'C3'], arp: ['C4', 'F4', 'A4', 'C5', 'F4', 'A4', 'C5', 'A4', 'C4', 'F4', 'A4', 'C5', 'F4', 'A4', 'C5', 'A4'] },
            // Measure 4: Em (E, B, E, G, B, E, G, B...)
            { chord: ['E1', 'E2', 'B2'], arp: ['B3', 'E4', 'G4', 'B4', 'E4', 'G4', 'B4', 'G4', 'B3', 'E4', 'G4', 'B4', 'E4', 'G4', 'B4', 'G4'] },
            // Measure 5: Dm (D, A, D, F, A, D, F, A...)
            { chord: ['D2', 'D3', 'A3'], arp: ['A3', 'D4', 'F4', 'A4', 'D4', 'F4', 'A4', 'F4', 'A3', 'D4', 'F4', 'A4', 'D4', 'F4', 'A4', 'F4'] },
            // Measure 6: Am - Climax
            { chord: ['A1', 'A2', 'E3'], arp: ['E4', 'A4', 'C5', 'E5', 'A4', 'C5', 'E5', 'A5', 'E5', 'C5', 'A4', 'E4', 'C4', 'A3', 'E4', 'A4'] }
        ];

        this.currentMeasure = 0;
        this.stepInMeasure = 0;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Analyser for real-time waveform visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;

        // Cathedral Reverb simulation (Impulse response convolution)
        this.reverbNode = this.createCathedralReverb(2.5, 0.4);

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
    }

    createCathedralReverb(duration, decay) {
        const rate = this.ctx.sampleRate;
        const length = rate * duration;
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / rate;
            const factor = Math.exp(-t / decay);
            left[i] = (Math.random() * 2 - 1) * factor;
            right[i] = (Math.random() * 2 - 1) * factor;
        }

        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;
        convolver.connect(this.masterGain);
        return convolver;
    }

    /**
     * Synthesizes an authentic Church Pipe Organ sound
     * using layered drawbar additive synthesis (8' Principal, 4' Octave, 16' Bourdon, 2' Superoctave)
     */
    playOrganPipe(freq, duration, velocity = 0.5, isBass = false) {
        if (!this.ctx || !freq) return;

        const now = this.ctx.currentTime;
        const noteGain = this.ctx.createGain();

        // Organ harmonics registration: [harmonic multiplier, relative amplitude]
        const harmonics = isBass ? [
            { mult: 0.5, amp: 0.8 },  // 32' Sub-bass
            { mult: 1.0, amp: 1.0 },  // 16' Principal
            { mult: 2.0, amp: 0.4 },  // 8' Octave
        ] : [
            { mult: 0.5, amp: 0.3 },  // 16' Bourdon
            { mult: 1.0, amp: 0.9 },  // 8' Principal
            { mult: 2.0, amp: 0.6 },  // 4' Octave
            { mult: 3.0, amp: 0.25 }, // 2 2/3' Twelfth
            { mult: 4.0, amp: 0.35 }, // 2' Superoctave
            { mult: 6.0, amp: 0.15 }  // Mixture
        ];

        harmonics.forEach(h => {
            const osc = this.ctx.createOscillator();
            const hGain = this.ctx.createGain();

            // Church organs have gentle vibrato / air fluting
            osc.type = h.mult <= 1 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq * h.mult, now);

            // Subtle natural detuning between pipes (chorus effect)
            const detune = (Math.random() - 0.5) * 6;
            osc.detune.setValueAtTime(detune, now);

            hGain.gain.setValueAtTime(h.amp * velocity, now);

            osc.connect(hGain);
            hGain.connect(noteGain);

            osc.start(now);
            osc.stop(now + duration + 0.1);
        });

        // Envelope: Organ has fast attack and sustained release in church space
        const attack = isBass ? 0.08 : 0.03;
        const release = isBass ? 0.3 : 0.22;

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(velocity, now + attack);
        noteGain.gain.setValueAtTime(velocity, now + duration);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration + release);

        // Dry/Wet routing
        noteGain.connect(this.masterGain);
        if (this.reverbNode) {
            noteGain.connect(this.reverbNode);
        }
    }

    start() {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.isPlaying) return;
        this.isPlaying = true;

        const sixteenthNoteTime = (60 / this.tempo) / 4; // in seconds
        const intervalMs = sixteenthNoteTime * 1000;

        this.stepInMeasure = 0;
        this.currentMeasure = 0;

        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            this.tick();
        }, intervalMs);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
            return false;
        } else {
            this.start();
            return true;
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    tick() {
        const pattern = this.patterns[this.currentMeasure];
        const stepTime = (60 / this.tempo) / 4;

        // Play sustained bass/chords on beat 1 and beat 9
        if (this.stepInMeasure === 0 || this.stepInMeasure === 8) {
            pattern.chord.forEach((noteName, idx) => {
                const freq = this.notes[noteName];
                if (freq) {
                    this.playOrganPipe(freq, stepTime * 8, 0.45 + idx * 0.1, true);
                }
            });
        }

        // Play arpeggio sixteenth note
        const arpNoteName = pattern.arp[this.stepInMeasure];
        if (arpNoteName && this.notes[arpNoteName]) {
            // Accent the first note of each 4-note group
            const isAccent = this.stepInMeasure % 4 === 0;
            const vel = isAccent ? 0.65 : 0.45;
            this.playOrganPipe(this.notes[arpNoteName], stepTime * 1.5, vel, false);
        }

        // Advance steps
        this.stepInMeasure++;
        if (this.stepInMeasure >= 16) {
            this.stepInMeasure = 0;
            this.currentMeasure = (this.currentMeasure + 1) % this.patterns.length;
        }
    }

    /**
     * Get frequency data for visualizer or 4D reactivity
     */
    getAudioFrequencyData() {
        if (!this.analyser || !this.isPlaying) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
}

// Global instance
window.interstellarAudio = new InterstellarAudioEngine();
