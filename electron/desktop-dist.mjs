import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const releaseDir = path.join(frontendDir, 'release');

const args = process.argv.slice(2);
const targetPlatform = args[0] || process.platform;
const targetArch = args[1] || process.arch;

fs.rmSync(releaseDir, { recursive: true, force: true });

runCommand(getNpmCommand(), ['run', 'build']);
runCommand(getNpmCommand(), ['run', getBackendBuildScript(targetPlatform, targetArch)]);
runCommand(getNpmCommand(), ['exec', 'electron-builder', '--', ...getElectronBuilderArgs(targetPlatform, targetArch)]);

const artifactPath = keepSingleDistributable(targetPlatform);
console.log(`Desktop artifact ready at ${artifactPath}`);

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function getBackendBuildScript(platform, arch) {
  switch (`${platform}:${arch}`) {
    case 'linux:x64':
      return 'desktop:backend:build:linux';
    case 'win32:x64':
      return 'desktop:backend:build:win';
    default:
      throw new Error(`Unsupported backend bundle target: ${platform}/${arch}`);
  }
}

function runCommand(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: frontendDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getElectronBuilderArgs(platform, arch) {
  const archFlag = toElectronArchFlag(arch);

  switch (platform) {
    case 'linux':
      return ['--linux', archFlag];
    case 'win32':
      return ['--win', archFlag];
    default:
      throw new Error(`Unsupported distribution platform: ${platform}`);
  }
}

function toElectronArchFlag(arch) {
  switch (arch) {
    case 'x64':
      return '--x64';
    case 'arm64':
      return '--arm64';
    default:
      throw new Error(`Unsupported distribution architecture: ${arch}`);
  }
}

function keepSingleDistributable(platform) {
  const extension = getDistributableExtension(platform);
  const entries = fs.existsSync(releaseDir) ? fs.readdirSync(releaseDir, { withFileTypes: true }) : [];
  let artifactPath;

  for (const entry of entries) {
    const fullPath = path.join(releaseDir, entry.name);

    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      continue;
    }

    if (!entry.name.endsWith(extension)) {
      fs.rmSync(fullPath, { force: true });
      continue;
    }

    if (artifactPath) {
      throw new Error(`Expected a single distributable, but found multiple ${extension} files in ${releaseDir}`);
    }

    artifactPath = fullPath;
  }

  if (!artifactPath) {
    throw new Error(`No distributable ${extension} artifact found in ${releaseDir}`);
  }

  return artifactPath;
}

function getDistributableExtension(platform) {
  switch (platform) {
    case 'linux':
      return '.AppImage';
    case 'win32':
      return '.exe';
    default:
      throw new Error(`Unsupported distribution platform: ${platform}`);
  }
}