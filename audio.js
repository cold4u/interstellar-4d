/**
 * INTERSTELLAR OFFICIAL BGM ENGINE
 * Streams the original Hans Zimmer "Interstellar Main Theme / Cornfield Chase" recording
 * routed through Web Audio API AnalyserNode for real-time visualization and 4D object reactivity.
 */

class InterstellarAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.analyser = null;
        this.audioEl = null;
        this.sourceNode = null;
        this.isPlaying = false;
        this.volume = 0.85;
        this.audioSrc = 'interstellar_theme.mp3';
    }

    init() {
        if (!this.audioEl) {
            this.audioEl = document.getElementById('interstellarAudioElement');
            if (!this.audioEl) {
                this.audioEl = new Audio(this.audioSrc);
                this.audioEl.loop = true;
                this.audioEl.id = 'interstellarAudioElement';
                document.body.appendChild(this.audioEl);
            }
            this.audioEl.loop = true;
        }

        if (this.ctx) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.8;

            // Connect HTML Audio Element to Web Audio graph
            if (!this.sourceNode && this.audioEl) {
                try {
                    this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);
                    this.sourceNode.connect(this.analyser);
                    this.analyser.connect(this.masterGain);
                    this.masterGain.connect(this.ctx.destination);
                } catch (err) {
                    // In some browsers when cross-origin or local file CORS applies, fallback to normal audio playback
                    console.warn('Audio graph connection notice:', err);
                }
            }
        } catch (e) {
            console.warn('Web Audio initialization:', e);
        }
    }

    start() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.audioEl) {
            this.audioEl.volume = this.volume;
            const playPromise = this.audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                }).catch(err => {
                    console.warn('Autoplay waiting for gesture:', err);
                });
            } else {
                this.isPlaying = true;
            }
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.audioEl) {
            this.audioEl.pause();
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
        if (this.audioEl) {
            this.audioEl.volume = this.volume;
        }
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    getAudioFrequencyData() {
        if (!this.analyser || !this.isPlaying) return null;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
}

// Global instance
window.interstellarAudio = new InterstellarAudioEngine();
