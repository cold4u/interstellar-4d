/**
 * 4D HYPER-DIMENSIONAL ENGINE
 * Implements 4D linear algebra, 6-plane rotation tensors,
 * perspective & stereographic 4D->3D->2D projection,
 * and real-time WebGL/Canvas rendering.
 */

class Hyper4DEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // 4D Rotation Angles (accumulated)
        this.angleXW = 0;
        this.angleYW = 0;
        this.angleZW = 0;
        this.angleXY = 0;
        this.angleYZ = 0;
        this.angleXZ = 0;

        // 4D Rotation Speeds
        this.speedXW = 0.012;
        this.speedYW = 0.008;
        this.speedZW = 0.005;
        this.speedXY = 0.006;
        this.speedYZ = 0.004;
        this.speedXZ = 0.003;

        // Camera / Projection Settings
        this.d4 = 2.8; // 4D camera distance
        this.d3 = 600; // 3D camera focal distance
        this.wSlice = 0.0; // W-dimension clipping / slice offset

        // 3D Orbit Camera (Mouse controls)
        this.camPitch = 0.35;
        this.camYaw = 0.45;
        this.camZoom = 1.0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Active Theme
        this.theme = 'gargantua'; // 'gargantua', 'cyan', 'quantum', 'monolith'
        this.themes = {
            gargantua: {
                primary: '#ffaa33',
                glow: 'rgba(255, 170, 51, 0.65)',
                secondary: '#ff5500',
                faceFill: 'rgba(255, 150, 40, 0.07)',
                vertex: '#ffffff'
            },
            cyan: {
                primary: '#00ffff',
                glow: 'rgba(0, 255, 255, 0.65)',
                secondary: '#0088ff',
                faceFill: 'rgba(0, 230, 255, 0.07)',
                vertex: '#ffffff'
            },
            quantum: {
                primary: '#c77dff',
                glow: 'rgba(199, 125, 255, 0.65)',
                secondary: '#7b2cbf',
                faceFill: 'rgba(180, 100, 255, 0.07)',
                vertex: '#ffffff'
            },
            monolith: {
                primary: '#f0f6fc',
                glow: 'rgba(255, 255, 255, 0.65)',
                secondary: '#8b949e',
                faceFill: 'rgba(255, 255, 255, 0.06)',
                vertex: '#58a6ff'
            }
        };

        // Active Geometry
        this.currentGeoName = 'tesseract';
        this.geometries = {};
        this.initGeometries();

        this.initCanvas();
        this.initEvents();
    }

    initCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    initEvents() {
        // Mouse Drag Orbit
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            this.camYaw += dx * 0.008;
            this.camPitch += dy * 0.008;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.lastMouseX = e.touches[0].clientX;
                this.lastMouseY = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - this.lastMouseX;
            const dy = e.touches[0].clientY - this.lastMouseY;
            this.camYaw += dx * 0.008;
            this.camPitch += dy * 0.008;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // Mouse Wheel Zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camZoom += e.deltaY * -0.001;
            this.camZoom = Math.max(0.4, Math.min(3.0, this.camZoom));
        }, { passive: false });
    }

    /**
     * Build 4D Geometric Polytopes and Complex Manifolds
     */
    initGeometries() {
        // 1. TESSERACT (Hypercube / 8-cell)
        // 16 vertices: all combinations of (±1, ±1, ±1, ±1)
        const tesseractVerts = [];
        for (let i = 0; i < 16; i++) {
            tesseractVerts.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }

        // 32 edges: connect vertices that differ in exactly 1 bit
        const tesseractEdges = [];
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                const diff = i ^ j;
                // Power of 2 means exactly one bit difference
                if ((diff & (diff - 1)) === 0) {
                    tesseractEdges.push([i, j]);
                }
            }
        }

        // 24 square faces
        const tesseractFaces = [];
        for (let d1 = 0; d1 < 4; d1++) {
            for (let d2 = d1 + 1; d2 < 4; d2++) {
                // Fix other 2 dimensions in 4 combinations (2^2 = 4)
                for (let v = 0; v < 4; v++) {
                    const face = [];
                    const fixedDims = [0, 1, 2, 3].filter(d => d !== d1 && d !== d2);
                    const b0 = (v & 1) ? 1 : 0;
                    const b1 = (v & 2) ? 1 : 0;

                    for (const [s1, s2] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
                        let idx = (b0 << fixedDims[0]) | (b1 << fixedDims[1]) | (s1 << d1) | (s2 << d2);
                        face.push(idx);
                    }
                    tesseractFaces.push(face);
                }
            }
        }

        this.geometries.tesseract = {
            name: 'Tesseract (8-Cell)',
            vertices: tesseractVerts,
            edges: tesseractEdges,
            faces: tesseractFaces,
            scale: 130
        };

        // 2. 16-CELL (Hexadecachoron / Cross-Polytope)
        // 8 vertices: all permutations of (±1.5, 0, 0, 0)
        const s16 = 1.8;
        const c16Verts = [
            [s16, 0, 0, 0], [-s16, 0, 0, 0],
            [0, s16, 0, 0], [0, -s16, 0, 0],
            [0, 0, s16, 0], [0, 0, -s16, 0],
            [0, 0, 0, s16], [0, 0, 0, -s16]
        ];
        // 24 edges: connect all pairs except opposites (i ^ 1 !== j)
        const c16Edges = [];
        for (let i = 0; i < 8; i++) {
            for (let j = i + 1; j < 8; j++) {
                if (Math.floor(i / 2) !== Math.floor(j / 2)) {
                    c16Edges.push([i, j]);
                }
            }
        }
        this.geometries.hexadecachoron = {
            name: '16-Cell (Cross-Polytope)',
            vertices: c16Verts,
            edges: c16Edges,
            faces: [],
            scale: 150
        };

        // 3. 24-CELL (Icositetrachoron)
        // 24 vertices: 8 cross-polytope vertices + 16 hypercube vertices scaled
        const c24Verts = [];
        const r2 = 2.0;
        // 8 vertices of form (±2, 0, 0, 0)
        for (let i = 0; i < 4; i++) {
            for (const sign of [1, -1]) {
                const pt = [0, 0, 0, 0];
                pt[i] = sign * r2;
                c24Verts.push(pt);
            }
        }
        // 16 vertices of form (±1, ±1, ±1, ±1)
        for (let i = 0; i < 16; i++) {
            c24Verts.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }
        // 96 edges: pairs with squared Euclidean distance == 4
        const c24Edges = [];
        for (let i = 0; i < 24; i++) {
            for (let j = i + 1; j < 24; j++) {
                const distSq = c24Verts[i].reduce((sum, v, k) => sum + (v - c24Verts[j][k]) ** 2, 0);
                if (Math.abs(distSq - 4.0) < 0.1) {
                    c24Edges.push([i, j]);
                }
            }
        }
        this.geometries.icositetrachoron = {
            name: '24-Cell (Hyperdiamond)',
            vertices: c24Verts,
            edges: c24Edges,
            faces: [],
            scale: 90
        };

        // 4. CLIFFORD TORUS (4D Imaginary Rotating Curved Manifold)
        // Parametric equations: x = r*cos(u), y = r*sin(u), z = r*cos(v), w = r*sin(v)
        const torusVerts = [];
        const torusEdges = [];
        const uSteps = 16;
        const vSteps = 16;
        const rTorus = 1.35;

        for (let i = 0; i < uSteps; i++) {
            const u = (i / uSteps) * Math.PI * 2;
            for (let j = 0; j < vSteps; j++) {
                const v = (j / vSteps) * Math.PI * 2;
                torusVerts.push([
                    rTorus * Math.cos(u),
                    rTorus * Math.sin(u),
                    rTorus * Math.cos(v),
                    rTorus * Math.sin(v)
                ]);

                // Grid edges along u and v
                const curr = i * vSteps + j;
                const nextU = ((i + 1) % uSteps) * vSteps + j;
                const nextV = i * vSteps + ((j + 1) % vSteps);
                torusEdges.push([curr, nextU]);
                torusEdges.push([curr, nextV]);
            }
        }
        this.geometries.cliffordTorus = {
            name: 'Clifford Torus (4D Surface)',
            vertices: torusVerts,
            edges: torusEdges,
            faces: [],
            scale: 130
        };

        // 5. CALABI-YAU 4D/6D Spacetime Projection
        const cyVerts = [];
        const cyEdges = [];
        const nSteps = 18;
        const mSteps = 18;
        for (let i = 0; i < nSteps; i++) {
            const z1 = (i / nSteps) * Math.PI * 2;
            for (let j = 0; j < mSteps; j++) {
                const z2 = (j / mSteps) * Math.PI * 2;
                // Calabi-Yau quintic threefold 4D slice
                const r = 1.25 + 0.35 * Math.cos(3 * z1);
                cyVerts.push([
                    r * Math.cos(z1) * Math.sin(z2),
                    r * Math.sin(z1) * Math.sin(z2),
                    r * Math.cos(z2) * Math.cos(2 * z1),
                    0.9 * Math.sin(3 * z1) * Math.cos(z2)
                ]);

                const curr = i * mSteps + j;
                const nextI = ((i + 1) % nSteps) * mSteps + j;
                const nextJ = i * mSteps + ((j + 1) % mSteps);
                cyEdges.push([curr, nextI]);
                cyEdges.push([curr, nextJ]);
            }
        }
        this.geometries.calabiYau = {
            name: 'Calabi-Yau Spacetime Fold',
            vertices: cyVerts,
            edges: cyEdges,
            faces: [],
            scale: 125
        };
    }

    setGeometry(name) {
        if (this.geometries[name]) {
            this.currentGeoName = name;
        }
    }

    setTheme(name) {
        if (this.themes[name]) {
            this.theme = name;
        }
    }

    /**
     * 4D Rotation in 6 Orthogonal Planes:
     * - XY, YZ, XZ (spatial 3D planes)
     * - XW, YW, ZW (4D hyperspace planes)
     */
    rotate4D(p, axw, ayw, azw, axy, ayz, axz) {
        let [x, y, z, w] = p;

        // 1. X-W Rotation
        if (axw !== 0) {
            const cos = Math.cos(axw);
            const sin = Math.sin(axw);
            const nx = x * cos - w * sin;
            const nw = x * sin + w * cos;
            x = nx;
            w = nw;
        }

        // 2. Y-W Rotation
        if (ayw !== 0) {
            const cos = Math.cos(ayw);
            const sin = Math.sin(ayw);
            const ny = y * cos - w * sin;
            const nw = y * sin + w * cos;
            y = ny;
            w = nw;
        }

        // 3. Z-W Rotation
        if (azw !== 0) {
            const cos = Math.cos(azw);
            const sin = Math.sin(azw);
            const nz = z * cos - w * sin;
            const nw = z * sin + w * cos;
            z = nz;
            w = nw;
        }

        // 4. X-Y Rotation
        if (axy !== 0) {
            const cos = Math.cos(axy);
            const sin = Math.sin(axy);
            const nx = x * cos - y * sin;
            const ny = x * sin + y * cos;
            x = nx;
            y = ny;
        }

        // 5. Y-Z Rotation
        if (ayz !== 0) {
            const cos = Math.cos(ayz);
            const sin = Math.sin(ayz);
            const ny = y * cos - z * sin;
            const nz = y * sin + z * cos;
            y = ny;
            z = nz;
        }

        // 6. X-Z Rotation
        if (axz !== 0) {
            const cos = Math.cos(axz);
            const sin = Math.sin(axz);
            const nx = x * cos - z * sin;
            const nz = x * sin + z * cos;
            x = nx;
            z = nz;
        }

        return [x, y, z, w];
    }

    /**
     * Perspective projection from 4D (x, y, z, w) -> 3D (X, Y, Z)
     */
    project4Dto3D(p, d4) {
        const [x, y, z, w] = p;
        // Avoid singularity when w >= d4
        const denom = Math.max(0.1, d4 - (w + this.wSlice));
        const k = d4 / denom;
        return [x * k, y * k, z * k, w];
    }

    /**
     * 3D Orbit Camera Rotation & Projection to 2D Screen
     */
    project3Dto2D(p3) {
        let [x, y, z, w] = p3;

        // Yaw (Y-axis)
        const cosY = Math.cos(this.camYaw);
        const sinY = Math.sin(this.camYaw);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Pitch (X-axis)
        const cosP = Math.cos(this.camPitch);
        const sinP = Math.sin(this.camPitch);
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;

        // Screen perspective projection
        const cameraDist = 4.2;
        const effectiveZ = z2 + cameraDist;
        const k3 = (this.d3 * this.camZoom) / Math.max(0.2, effectiveZ);

        const screenX = this.width / 2 + x1 * k3;
        const screenY = this.height / 2 + y2 * k3;

        return {
            x: screenX,
            y: screenY,
            z: z2,
            w: w,
            scale: k3
        };
    }

    /**
     * Update rotation angles based on speed and audio reactive pulse
     */
    update(audioIntensity = 0) {
        // Audio reactive acceleration
        const boost = 1.0 + audioIntensity * 0.8;
        this.angleXW += this.speedXW * boost;
        this.angleYW += this.speedYW * boost;
        this.angleZW += this.speedZW * boost;
        this.angleXY += this.speedXY * boost;
        this.angleYZ += this.speedYZ * boost;
        this.angleXZ += this.speedXZ * boost;
    }

    /**
     * Render the 4D manifold on HTML5 Canvas
     */
    render(audioIntensity = 0) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const geo = this.geometries[this.currentGeoName];
        if (!geo) return;

        const currentTheme = this.themes[this.theme];
        const projected2D = [];
        const transformed4D = [];

        // 1. Transform all vertices through 4D rotation and 4D->3D->2D projection
        for (let i = 0; i < geo.vertices.length; i++) {
            const v4 = geo.vertices[i];
            const rot = this.rotate4D(
                v4,
                this.angleXW, this.angleYW, this.angleZW,
                this.angleXY, this.angleYZ, this.angleXZ
            );
            transformed4D.push(rot);

            const p3 = this.project4Dto3D(rot, this.d4);
            const p2 = this.project3Dto2D(p3);
            p2.index = i;
            projected2D.push(p2);
        }

        // 2. Render Semi-Transparent Faces (if geometry has faces)
        if (geo.faces && geo.faces.length > 0) {
            // Sort faces by average depth Z for painter's algorithm
            const sortedFaces = [...geo.faces].map(faceIndices => {
                const avgZ = faceIndices.reduce((acc, idx) => acc + projected2D[idx].z, 0) / faceIndices.length;
                const avgW = faceIndices.reduce((acc, idx) => acc + projected2D[idx].w, 0) / faceIndices.length;
                return { indices: faceIndices, z: avgZ, w: avgW };
            }).sort((a, b) => b.z - a.z);

            for (const face of sortedFaces) {
                ctx.beginPath();
                const p0 = projected2D[face.indices[0]];
                ctx.moveTo(p0.x, p0.y);
                for (let k = 1; k < face.indices.length; k++) {
                    const pk = projected2D[face.indices[k]];
                    ctx.lineTo(pk.x, pk.y);
                }
                ctx.closePath();

                // Dynamic opacity based on W-depth (4th dimension)
                const wFactor = (face.w + 1.5) / 3.0;
                ctx.fillStyle = currentTheme.faceFill;
                ctx.fill();
            }
        }

        // 3. Render 4D Edges (Glowing hyper-lines)
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Sort edges by average depth Z
        const sortedEdges = geo.edges.map(edge => {
            const pA = projected2D[edge[0]];
            const pB = projected2D[edge[1]];
            return {
                a: pA,
                b: pB,
                z: (pA.z + pB.z) / 2,
                w: (pA.w + pB.w) / 2
            };
        }).sort((a, b) => b.z - a.z);

        for (const edge of sortedEdges) {
            const { a, b, w } = edge;

            // Interpolate color and line width according to 4D coordinate W
            // Points closer in 4D space glow brighter with gold/cyan
            const wNorm = Math.max(0, Math.min(1, (w + 1.4) / 2.8));
            const lineWidth = Math.max(1.0, (1.2 + wNorm * 2.2 + audioIntensity * 1.5));

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = currentTheme.primary;
            ctx.shadowColor = currentTheme.glow;
            ctx.shadowBlur = 8 + wNorm * 12 + audioIntensity * 15;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
        ctx.restore();

        // 4. Render Vertices (Glowing Hyper-Nodes)
        for (const p of projected2D) {
            const wNorm = Math.max(0, Math.min(1, (p.w + 1.4) / 2.8));
            const radius = Math.max(2.0, 3.2 + wNorm * 3.5 + audioIntensity * 2.5);

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = currentTheme.vertex;
            ctx.shadowColor = currentTheme.primary;
            ctx.shadowBlur = 12 + audioIntensity * 20;
            ctx.fill();
            ctx.restore();
        }

        return transformed4D;
    }
}

window.Hyper4DEngine = Hyper4DEngine;
