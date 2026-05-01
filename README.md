# Bakasub - Web Interface 🌸✨

Oh, so you're looking at my frontend code now? D-don't stare too closely! It's not like I spent hours crafting this sleek, responsive React interface just to make your life easier! I just couldn't stand looking at a boring, ugly terminal to translate my shows all day, okay? B-baka!

> **Listen up!** This repository is just my pretty face (the UI). If you want to actually install and run Bakasub like a normal person, go check out the [main orchestration repository](https://github.com/lsilvatti/bakasub).

## 🎀 What I'm Wearing (Tech Stack)
Don't even think about bringing messy code in here. My structure is flawless.
* **Framework:** React 18 + TypeScript (Because I like my code strictly typed, unlike your messy life!)
* **Build Tool:** Vite (I don't have time to wait for Webpack to bundle, I need speed!)
* **Data Fetching:** TanStack Query v5 (I handle caching, retries, and background updates automatically. You're welcome.)
* **Styling:** CSS Modules with a custom Design System (No global CSS spaghetti here. Complete with Dark/Light mode support!)
* **Real-Time:** Server-Sent Events (SSE) via custom hooks. I stream the backend progress live so you don't have to refresh like an idiot.
* **i18n:** `react-i18next` (Yes, I speak multiple languages. Impressed?)

## 💻 How to Date Me (Local Development)

If you really want to modify my components, you better follow the rules.

### 1. Prerequisites
You need **Node.js 20+**. Don't come crying to me if you're using an ancient version.

### 2. Setup
Clone me and install my dependencies:
```bash
npm install
```

Create a `.env` file in the project root so I know where my backend brain is located and also with your TMDB Key (I promise I'll take good care of it).
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_TMDB_ACCESS_TOKEN=your_token_here
```

When Bakasub runs inside Electron, the shell can override the backend URL at runtime without rebuilding the frontend by setting `window.BAKASUB_RUNTIME_CONFIG = { apiUrl: 'http://127.0.0.1:8080/api/v1' }` before React boots.

There is now a reference shell under `electron/main.cjs` and `electron/preload.cjs`. The preload injects `window.BAKASUB_RUNTIME_CONFIG`, and `index.html` initializes that global before the React bundle so the same mechanism also works in static deployments.

For development, you can still ask Electron to launch the backend from source by setting `BAKASUB_BACKEND_COMMAND`. Example: `BAKASUB_BACKEND_COMMAND="go run ./cmd/server" BAKASUB_BACKEND_CWD="../bakasub-backend" npm run desktop:run`.

For packaged desktop builds, Electron now prefers a backend binary bundled under `electron/resources/backend/<platform>-<arch>/`. When it launches that bundled backend, it stores the SQLite database under the app user-data directory and binds the API to `127.0.0.1:8080` unless `LISTEN_ADDR`, `DATABASE_URL`, or `BAKASUB_API_URL` are overridden.


### 3. Run Me!
Start the development server. 
```bash
npm run dev
```
*I'll be waiting for you at `http://localhost:5173`. Don't keep me waiting!*

## 📦 Production Build
When you're finally done messing around and want to serve me properly:
```bash
npm run build
```
I'll generate highly optimized static files in the `/dist` folder, ready to be hosted by Nginx or whatever static server you prefer.

## 🖥️ Desktop Distribution
If you want a single Electron app with the backend already embedded, this is the main command:

```bash
npm run desktop:dist
```

Optional commands for debugging or cross-platform packaging:

```bash
npm run desktop:pack:dir
npm run desktop:dist:linux
npm run desktop:dist:win
```

`desktop:dist` builds the frontend, compiles the Go backend for the current platform, runs `electron-builder`, and prunes auxiliary packaging files so `/release` keeps only a single distributable desktop artifact.

`desktop:pack:dir` produces an unpacked desktop app for the current platform in `/release`.

`desktop:dist:linux` produces a single Linux `AppImage`.

`desktop:dist:win` produces a single Windows NSIS installer executable. On Linux hosts, full Windows packaging may still require the usual Wine-based toolchain.