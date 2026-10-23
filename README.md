# 🌌 INTERSTELLAR // 4D Hyperspace Tesseract

An interactive 4D hyper-dimensional manifold visualizer inspired by Christopher Nolan's *Interstellar*, featuring real-time Web Audio API synthesized Hans Zimmer church organ score (*"Cornfield Chase"* & *"Stay"*), 6 orthogonal 4D rotation planes, and relativistic spatiotemporal telemetry.

![Interstellar 4D Preview](https://img.shields.io/badge/Dimensions-4D%20Hyperspace-ffaa33?style=for-the-badge)
![Audio Engine](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio-00ffff?style=for-the-badge)
![Deployment](https://img.shields.io/badge/GitHub%20Pages-Ready-00ff88?style=for-the-badge)

---

## ✨ Features

- **4D Polytopes & Imaginary Manifolds**:
  - **Tesseract (8-Cell / Hypercube)**: 16 vertices, 32 glowing edges, 24 hyper-faces, and 8 cubic cells folding into each other through the 4th spatial dimension ($w$).
  - **16-Cell (Hexadecachoron)**: Dual of the tesseract, cross-polytope crystal.
  - **24-Cell (Icositetrachoron)**: Self-dual 4D regular polytope unique to four dimensions.
  - **Clifford Torus / Hopf Fibration**: 4D imaginary curved manifold rotating through hyperspace.
  - **Calabi-Yau Projection**: Spacetime folding representing compactified string-theory dimensions.
- **6 Orthogonal 4D Rotation Planes**:
  - $X-W$, $Y-W$, $Z-W$ (Hyperspace warp planes: rotate vertices into and out of the 4th dimension)
  - $X-Y$, $Y-Z$, $X-Z$ (Standard 3D rotations)
- **Hans Zimmer Interstellar BGM Engine**:
  - Real-time procedural pipe organ synthesizer built with native Web Audio API (multiple drawbar harmonics: 32' Sub-bass, 16' Bourdon, 8' Principal, 4' Octave, natural chorus detuning, and cathedral reverb convolution).
  - 100% offline, zero external dependencies, zero latency, no broken audio links or copyright takedowns.
  - Real-time audio frequency visualizer that pulses the 4D geometry to the music!
- **Relativistic Telemetry & Gargantua Atmosphere**:
  - Gargantua black hole accretion disk glow & gravitational lensing ring.
  - Relativistic time dilation counter (1s on Miller's planet = 7.1 Earth years).
  - Live 4D coordinate matrix $[x, y, z, w]$ tracking the vertices as they warp through dimensions.
  - 3D orbit mouse controls (drag to orbit, scroll to zoom).

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Option 1: Fast Automated Push Script
Run this script inside this folder:
```bash
bash deploy_to_github.sh
```
Follow the prompt to enter your GitHub username and repository name.

---

### Option 2: Manual Setup (3 Simple Commands)

1. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `interstellar-4d` (or any name you prefer)
   - Choose **Public** and leave "Initialize with README" **unchecked**.

2. **Push your code from terminal**:
   ```bash
   cd /home/cold/.gemini/antigravity/scratch/interstellar-4d
   git add .
   git commit -m "Initialize Interstellar 4D Tesseract with Hans Zimmer BGM"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/interstellar-4d.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - In your GitHub repository, click **Settings** (gear icon) -> **Pages** (in left sidebar).
   - Under **Build and deployment** -> **Source**:
     - Choose **GitHub Actions** (the included `.github/workflows/deploy.yml` will deploy it automatically!), OR:
     - Choose **Deploy from a branch** -> Branch: `main` / Folder: `/(root)` -> Click **Save**.
   - Your website will be live in ~60 seconds at:
     ```
     https://<YOUR_GITHUB_USERNAME>.github.io/interstellar-4d/
     ```

---

## 💻 Local Testing & Preview

To preview the website locally on your computer:
```bash
python3 -m http.server 8080
```
Then open your browser to [http://localhost:8080](http://localhost:8080).

---

## 📐 The Mathematics of 4D Space

In 3-dimensional space, rotation occurs around a 1-dimensional axis (e.g. rotating around the Z-axis in the XY-plane).
In 4-dimensional space $\mathbb{R}^4$, rotation occurs around an invariant **2-dimensional plane**!

Points in 4D space have coordinates $(x, y, z, w)$. Perspective projection from 4D to 3D is defined by:
$$k = \frac{d_4}{d_4 - w}$$
$$X = x \cdot k, \quad Y = y \cdot k, \quad Z = z \cdot k$$

As the object rotates in planes like $X-W$, vertices move forward and backward along the $w$-axis. When projected to 3D, parts of the hypercube appear to turn inside-out while preserving their mathematical 4D right angles — exactly illustrating how higher-dimensional beings perceived Cooper's bookshelf tesseract inside the singularity of Gargantua.
