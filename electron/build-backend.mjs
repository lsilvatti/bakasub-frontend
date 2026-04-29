import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(frontendDir, '..', 'bakasub-backend');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filteredArgs = args.filter((arg) => arg !== '--dry-run');

const targetPlatform = filteredArgs[0] || process.platform;
const targetArch = filteredArgs[1] || process.arch;

const goOS = toGoOS(targetPlatform);
const goArch = toGoArch(targetArch);
const executableName = targetPlatform === 'win32' ? 'bakasub-server.exe' : 'bakasub-server';
const outputDir = path.join(frontendDir, 'electron', 'resources', 'backend', `${targetPlatform}-${targetArch}`);
const outputPath = path.join(outputDir, executableName);

const summary = {
  frontendDir,
  backendDir,
  targetPlatform,
  targetArch,
  goOS,
  goArch,
  outputDir,
  outputPath,
};

if (dryRun) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (!fs.existsSync(path.join(backendDir, 'go.mod'))) {
  throw new Error(`Backend repository not found at ${backendDir}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const build = spawnSync('go', ['build', '-trimpath', '-o', outputPath, './cmd/server'], {
  cwd: backendDir,
  env: {
    ...process.env,
    CGO_ENABLED: '0',
    GOOS: goOS,
    GOARCH: goArch,
  },
  stdio: 'inherit',
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

console.log(`Bundled backend written to ${outputPath}`);

function toGoOS(platform) {
  switch (platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'darwin';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function toGoArch(arch) {
  switch (arch) {
    case 'x64':
      return 'amd64';
    case 'arm64':
      return 'arm64';
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }
}