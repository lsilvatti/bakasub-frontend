const fs = require('node:fs');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

let backendProcess;
let isAppQuitting = false;

function getListenAddr() {
  return process.env.LISTEN_ADDR || '127.0.0.1:8080';
}

function getApiBaseUrl() {
  if (process.env.BAKASUB_API_URL) {
    return process.env.BAKASUB_API_URL.replace(/\/+$/, '');
  }

  const listenAddr = getListenAddr();
  if (listenAddr.startsWith(':')) {
    return `http://127.0.0.1${listenAddr}/api/v1`;
  }

  if (listenAddr.startsWith('0.0.0.0:')) {
    return `http://127.0.0.1:${listenAddr.slice('0.0.0.0:'.length)}/api/v1`;
  }

  return `http://${listenAddr}/api/v1`;
}

function getBundledBackendBinary() {
  const executableName = process.platform === 'win32' ? 'bakasub-server.exe' : 'bakasub-server';
  const platformDir = `${process.platform}-${process.arch}`;
  const candidateRoots = [];

  if (app.isPackaged) {
    candidateRoots.push(path.join(process.resourcesPath, 'backend'));
  }

  candidateRoots.push(path.join(__dirname, 'resources', 'backend'));

  for (const root of candidateRoots) {
    const candidate = path.join(root, platformDir, executableName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function ensureLocalSecretKey(secretDir) {
  const configuredSecret = process.env.SECRET_KEY?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  const secretPath = path.join(secretDir, 'secret.key');
  if (fs.existsSync(secretPath)) {
    const persistedSecret = fs.readFileSync(secretPath, 'utf8').trim();
    if (persistedSecret) {
      return persistedSecret;
    }
  }

  const generatedSecret = crypto.randomUUID();
  fs.writeFileSync(secretPath, generatedSecret, { mode: 0o600 });
  return generatedSecret;
}

async function waitForBackendHealth(apiBaseUrl, timeoutMs = 30000) {
  const healthUrl = `${apiBaseUrl.replace(/\/+$/, '')}/health`;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the timeout is reached.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for backend health at ${healthUrl}`);
}

function getRendererEntry() {
  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) {
    return { type: 'url', value: startUrl };
  }

  return {
    type: 'file',
    value: path.join(__dirname, '..', 'dist', 'index.html'),
  };
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const entry = getRendererEntry();
  if (entry.type === 'url') {
    window.loadURL(entry.value);
    return;
  }

  window.loadFile(entry.value);
}

function startBackendIfConfigured() {
  const backendCommand = process.env.BAKASUB_BACKEND_COMMAND?.trim();
  const bundledBackendBinary = getBundledBackendBinary();
  if (!backendCommand && !bundledBackendBinary) {
    return false;
  }

  const databasePath = process.env.DATABASE_URL || path.join(app.getPath('userData'), 'backend', 'bakasub.db');
  const apiBaseUrl = getApiBaseUrl();
  const dataDir = path.dirname(databasePath);

  fs.mkdirSync(dataDir, { recursive: true });

  process.env.DATABASE_URL = databasePath;
  process.env.LISTEN_ADDR = getListenAddr();
  process.env.BAKASUB_API_URL = apiBaseUrl;
  process.env.SECRET_KEY = ensureLocalSecretKey(dataDir);

  if (backendCommand) {
    backendProcess = spawn(backendCommand, {
      cwd: process.env.BAKASUB_BACKEND_CWD || path.join(__dirname, '..'),
      env: {
        ...process.env,
      },
      shell: true,
      stdio: 'inherit',
    });
  } else {
    backendProcess = spawn(bundledBackendBinary, [], {
      cwd: path.dirname(bundledBackendBinary),
      env: {
        ...process.env,
      },
      stdio: 'inherit',
    });
  }

  backendProcess.once('exit', (code) => {
    backendProcess = undefined;

    if (!isAppQuitting && code && code !== 0) {
      app.quit();
    }
  });

  return true;
}

function stopBackendIfNeeded() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }
}

app.whenReady().then(async () => {
  const backendStarted = startBackendIfConfigured();

  if (backendStarted) {
    try {
      await waitForBackendHealth(process.env.BAKASUB_API_URL || getApiBaseUrl());
    } catch (error) {
      console.error(`[electron] ${error instanceof Error ? error.message : String(error)}`);
      app.quit();
      return;
    }
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isAppQuitting = true;
  stopBackendIfNeeded();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});