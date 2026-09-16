# AAWAZ Frontend (MVP / Proof of Concept)

React + Vite frontend web player for AAWAZ, an Indian independent music streaming platform.

## Features
- **Modern Dark UI**: aesthetic dark-mode layout inspired by modern music applications.
- **Persistent Fixed Bottom Player**: stays docked and accessible across track browsing.
- **Audio Controls**: Play, Pause, Previous, Next (playlist wrapping), Volume scrub & Mute toggle.
- **Seamless Scrubbing & Seeking**: interactive timeline wired to HTML5 audio with HTTP 206 streaming.
- **Live Equalizer Wave**: visually indicates which song card is actively playing.
- **Robust Error Handling**: graceful offline indicators, network error banners, and empty state guides.
- **Pure JavaScript**: no TypeScript or heavy external design systems; fast and lightweight.

## Setup & Running Locally

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default:
```env
VITE_API_URL=http://localhost:8000
```
For production deployments (e.g. Vercel, Netlify):
```env
VITE_API_URL=https://your-aawaz-backend.onrender.com
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/` ready to deploy to any CDN or static hosting platform.
