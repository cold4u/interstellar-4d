/**
 * INTERSTELLAR 4D APPLICATION CONTROLLER
 * Coordinates 4D Engine, Gargantua Cosmic Starfield, Audio Synthesizer,
 * Relativistic Telemetry, and User Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Engines
    const hyperEngine = new window.Hyper4DEngine('hyperCanvas');
    const audio = window.interstellarAudio;

    // 2. Cosmic Background: Gargantua Black Hole Accretion Disk & Starfield
    const bgCanvas = document.getElementById('bgCanvas');
    const bgCtx = bgCanvas.getContext('2d');
    let bgWidth = window.innerWidth;
    let bgHeight = window.innerHeight;

    function resizeBg() {
        bgWidth = window.innerWidth;
        bgHeight = window.innerHeight;
        bgCanvas.width = bgWidth;
        bgCanvas.height = bgHeight;
    }
    resizeBg();
    window.addEventListener('resize', resizeBg);

    // Generate stars
    const stars = [];
    const starCount = 380;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * 2000 - 1000,
            y: Math.random() * 2000 - 1000,
            z: Math.random() * 1000 + 1,
            size: Math.random() * 1.5 + 0.5,
            color: Math.random() > 0.8 ? '#ffddaa' : (Math.random() > 0.6 ? '#88ccff' : '#ffffff')
        });
    }

    function renderCosmicBackground(audioPulse = 0) {
        bgCtx.fillStyle = '#020408';
        bgCtx.fillRect(0, 0, bgWidth, bgHeight);

        const cx = bgWidth / 2;
        const cy = bgHeight / 2;

        // Clean starfield with warp motion without any obstructive center circle or overlay

        // Starfield with warp motion
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.z -= 0.6 + audioPulse * 1.5;
            if (s.z <= 0) {
                s.z = 1000;
                s.x = Math.random() * 2000 - 1000;
                s.y = Math.random() * 2000 - 1000;
            }

            const k = 400 / s.z;
            const px = cx + s.x * k;
            const py = cy + s.y * k;

            if (px >= 0 && px < bgWidth && py >= 0 && py < bgHeight) {
                const size = s.size * (1 - s.z / 1000) * 1.8;
                bgCtx.fillStyle = s.color;
                bgCtx.beginPath();
                bgCtx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
                bgCtx.fill();
            }
        }
    }

    // 3. Audio Visualizer Mini-Canvas
    const visCanvas = document.getElementById('audioVisualizerCanvas');
    const visCtx = visCanvas.getContext('2d');

    function renderMiniVisualizer(freqData) {
        visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
        if (!freqData) {
            // Idle line
            visCtx.strokeStyle = 'rgba(255, 170, 51, 0.4)';
            visCtx.beginPath();
            visCtx.moveTo(0, visCanvas.height / 2);
            visCtx.lineTo(visCanvas.width, visCanvas.height / 2);
            visCtx.stroke();
            return;
        }

        const barWidth = visCanvas.width / 16;
        for (let i = 0; i < 16; i++) {
            const val = freqData[i] || 0;
            const barHeight = (val / 255) * visCanvas.height;
            const x = i * barWidth;
            const y = visCanvas.height - barHeight;

            visCtx.fillStyle = i % 2 === 0 ? '#ffaa33' : '#00ffff';
            visCtx.fillRect(x, y, barWidth - 1, barHeight);
        }
    }

    // 4. Intro Overlay & Audio Autoplay Trigger
    const introOverlay = document.getElementById('introOverlay');
    const enterBtn = document.getElementById('enterBtn');
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const audioLabel = document.getElementById('audioLabel');
    const audioIcon = document.getElementById('audioIcon');
    const volumeSlider = document.getElementById('volumeSlider');

    function startExperience() {
        introOverlay.classList.add('hidden');
        audio.start();
        updateAudioButtonUI(true);
    }

    enterBtn.addEventListener('click', startExperience);

    // Also support starting with Space or Enter key
    window.addEventListener('keydown', (e) => {
        if (!introOverlay.classList.contains('hidden') && (e.code === 'Space' || e.code === 'Enter')) {
            startExperience();
        }
    });

    function updateAudioButtonUI(playing) {
        if (playing) {
            audioLabel.textContent = 'BGM: PLAYING';
            audioIcon.textContent = '🔊';
            audioToggleBtn.style.color = 'var(--accent-gold)';
        } else {
            audioLabel.textContent = 'BGM: MUTED';
            audioIcon.textContent = '🔇';
            audioToggleBtn.style.color = 'var(--text-muted)';
        }
    }

    audioToggleBtn.addEventListener('click', () => {
        const isNowPlaying = audio.toggle();
        updateAudioButtonUI(isNowPlaying);
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.setVolume(parseFloat(e.target.value));
    });

    // 5. Relativistic Earth Time Counter
    const earthYearsPassedEl = document.getElementById('earthYearsPassed');
    const startTime = Date.now();
    // In Interstellar: 1 hour on Miller's planet = 7 years on Earth
    // That means: 1 second on Miller's planet = 7 / 3600 years = ~0.001944 Earth years
    // Every 514 seconds is 1 full Earth year!
    function updateTimeDilation() {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const earthYears = elapsedSeconds * (7.0 / 3600) * 12; // Scaled slightly for cinematic real-time feeling
        earthYearsPassedEl.textContent = earthYears.toFixed(2);
    }

    // 6. 4D Coordinate Telemetry Matrix Display
    const matrixDisplayEl = document.getElementById('matrixDisplay');
    let matrixUpdateThrottle = 0;

    function updateMatrixTelemetry(transformed4D) {
        matrixUpdateThrottle++;
        if (matrixUpdateThrottle % 8 !== 0 || !transformed4D) return;

        let html = '';
        // Display up to 8 key vertices for readability
        const count = Math.min(8, transformed4D.length);
        for (let i = 0; i < count; i++) {
            const [x, y, z, w] = transformed4D[i];
            html += `<div class="matrix-row">
                <span>V${i < 10 ? '0' + i : i}:</span>
                <span>X:${x.toFixed(2)}</span>
                <span>Y:${y.toFixed(2)}</span>
                <span>Z:${z.toFixed(2)}</span>
                <span class="coord-w">W:${w.toFixed(2)}</span>
            </div>`;
        }
        matrixDisplayEl.innerHTML = html;
    }

    // 7. Bind 4D Sliders
    const sliders = [
        { id: 'rot-xw', prop: 'speedXW', labelId: 'val-xw' },
        { id: 'rot-yw', prop: 'speedYW', labelId: 'val-yw' },
        { id: 'rot-zw', prop: 'speedZW', labelId: 'val-zw' },
        { id: 'rot-xy', prop: 'speedXY', labelId: 'val-xy' },
        { id: 'rot-yz', prop: 'speedYZ', labelId: 'val-yz' },
        { id: 'proj-d4', prop: 'd4', labelId: 'val-d4' },
        { id: 'w-slice', prop: 'wSlice', labelId: 'val-wslice' }
    ];

    sliders.forEach(s => {
        const input = document.getElementById(s.id);
        const label = document.getElementById(s.labelId);
        input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            hyperEngine[s.prop] = val;
            label.textContent = val.toFixed(s.prop === 'd4' ? 1 : (s.prop === 'wSlice' ? 2 : 3));
        });
    });

    // Preset buttons
    document.getElementById('btnWarp').addEventListener('click', () => {
        document.getElementById('rot-xw').value = 0.035;
        document.getElementById('rot-yw').value = 0.025;
        document.getElementById('rot-zw').value = 0.020;
        hyperEngine.speedXW = 0.035;
        hyperEngine.speedYW = 0.025;
        hyperEngine.speedZW = 0.020;
        document.getElementById('val-xw').textContent = '0.035';
        document.getElementById('val-yw').textContent = '0.025';
        document.getElementById('val-zw').textContent = '0.020';
    });

    document.getElementById('btnStable').addEventListener('click', () => {
        document.getElementById('rot-xw').value = 0.008;
        document.getElementById('rot-yw').value = 0.004;
        document.getElementById('rot-zw').value = 0.002;
        hyperEngine.speedXW = 0.008;
        hyperEngine.speedYW = 0.004;
        hyperEngine.speedZW = 0.002;
        document.getElementById('val-xw').textContent = '0.008';
        document.getElementById('val-yw').textContent = '0.004';
        document.getElementById('val-zw').textContent = '0.002';
    });

    document.getElementById('btnReset').addEventListener('click', () => {
        hyperEngine.angleXW = 0;
        hyperEngine.angleYW = 0;
        hyperEngine.angleZW = 0;
        hyperEngine.angleXY = 0;
        hyperEngine.angleYZ = 0;
        hyperEngine.angleXZ = 0;
        hyperEngine.camPitch = 0.35;
        hyperEngine.camYaw = 0.45;
        hyperEngine.camZoom = 1.0;
        hyperEngine.wSlice = 0.0;
        document.getElementById('w-slice').value = 0;
        document.getElementById('val-wslice').textContent = '0.00';
    });

    // Geometry Switcher buttons
    const geoButtons = document.querySelectorAll('.geo-btn');
    geoButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            geoButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            hyperEngine.setGeometry(btn.dataset.geo);
        });
    });

    // Theme Switcher buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            hyperEngine.setTheme(btn.dataset.theme);
        });
    });

    // 8. Main Application Animation Loop
    function loop() {
        // Sample Audio frequency data
        const freqData = audio.getAudioFrequencyData();
        let audioIntensity = 0;
        if (freqData) {
            // Calculate normalized average amplitude
            const sum = freqData.reduce((acc, v) => acc + v, 0);
            audioIntensity = (sum / freqData.length) / 255;
        }

        renderCosmicBackground(audioIntensity);
        hyperEngine.update(audioIntensity);
        const transformed4D = hyperEngine.render(audioIntensity);

        renderMiniVisualizer(freqData);
        updateTimeDilation();
        updateMatrixTelemetry(transformed4D);

        requestAnimationFrame(loop);
    }

    loop();
});
