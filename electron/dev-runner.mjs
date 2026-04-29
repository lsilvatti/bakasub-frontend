import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(frontendDir, '..', 'bakasub-backend');

const viteHost = process.env.BAKASUB_DESKTOP_HOST || '127.0.0.1';
const vitePort = process.env.BAKASUB_DESKTOP_PORT || '5173';
const rendererUrl = process.env.ELECTRON_START_URL || `http://${viteHost}:${vitePort}`;
const apiUrl = process.env.BAKASUB_API_URL || 'http://127.0.0.1:8080/api/v1';
const backendHealthUrl = `${apiUrl.replace(/\/$/, '')}/health`;
const backendDatabase = process.env.DATABASE_URL || path.join(backendDir, 'data', 'electron-dev.db');
const skipBackend = process.env.BAKASUB_SKIP_BACKEND === '1';

const childProcesses = [];

function isWindows() {
  return process.platform === 'win32';
}

function npmCommand() {
  return isWindows() ? 'npm.cmd' : 'npm';
}

function logConfiguration() {
  const summary = {
    frontendDir,
    backendDir,
    rendererUrl,
    apiUrl,
    backendHealthUrl,
    backendDatabase,
    skipBackend,
    backendDetected: fs.existsSync(path.join(backendDir, 'go.mod')),
  };

  console.log(JSON.stringify(summary, null, 2));
}

function registerChild(child) {
  childProcesses.push(child);
  child.once('exit', () => {
    const index = childProcesses.indexOf(child);
    if (index >= 0) {
      childProcesses.splice(index, 1);
    }
  });
  return child;
}

function spawnProcess(command, args, options) {
  return registerChild(spawn(command, args, {
    stdio: 'inherit',
    ...options,
  }));
}

async function waitForUrl(url, label, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

function terminateChildren(exitCode) {
  for (const child of [...childProcesses]) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => terminateChildren(130));
process.on('SIGTERM', () => terminateChildren(143));

if (process.argv.includes('--dry-run')) {
  logConfiguration();
  process.exit(0);
}

let backendProcess;

if (!skipBackend && fs.existsSync(path.join(backendDir, 'go.mod'))) {
  backendProcess = spawnProcess('go', ['run', './cmd/server'], {
    cwd: backendDir,
    env: {
      ...process.env,
      DATABASE_URL: backendDatabase,
      PORT: '8080',
    },
  });

  backendProcess.once('exit', (code) => {
    if (code && code !== 0) {
      terminateChildren(code);
    }
  });
} else if (!skipBackend) {
  console.warn(`[desktop:dev] Backend repository not found at ${backendDir}. Start the backend manually or set BAKASUB_SKIP_BACKEND=1.`);
}

const viteProcess = spawnProcess(npmCommand(), ['run', 'dev', '--', '--host', viteHost, '--port', vitePort], {
  cwd: frontendDir,
  env: {
    ...process.env,
  },
});

viteProcess.once('exit', (code) => {
  if (code && code !== 0) {
    terminateChildren(code);
  }
});

try {
  await Promise.all([
    waitForUrl(rendererUrl, 'Vite renderer'),
    waitForUrl(backendHealthUrl, 'backend health endpoint'),
  ]);
} catch (error) {
  console.error(`[desktop:dev] ${error instanceof Error ? error.message : String(error)}`);
  terminateChildren(1);
}

const electronProcess = spawnProcess(npmCommand(), ['run', 'desktop:run'], {
  cwd: frontendDir,
  env: {
    ...process.env,
    ELECTRON_START_URL: rendererUrl,
    BAKASUB_API_URL: apiUrl,
  },
});

electronProcess.once('exit', (code) => {
  terminateChildren(code ?? 0);
});