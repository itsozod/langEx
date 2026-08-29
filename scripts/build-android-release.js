#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = process.cwd();
const ENV_FILE = path.resolve(PROJECT_ROOT, '.env.production.local');
const ANDROID_DIR = path.resolve(PROJECT_ROOT, 'android');
const APK_PATH = path.resolve(ANDROID_DIR, 'app/build/outputs/apk/release/app-release.apk');
const PACKAGE_NAME = 'com.ozod2905.langEx';

function loadProductionEnvironment() {
  if (!fs.existsSync(ENV_FILE)) {
    throw new Error(
      'Missing .env.production.local. Add EXPO_PUBLIC_API_URL before creating a release build.',
    );
  }

  for (const rawLine of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function validateEnvironment() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('EXPO_PUBLIC_API_URL is missing from .env.production.local.');

  const url = new URL(apiUrl);
  if (url.protocol !== 'https:') {
    throw new Error('The production API URL must use HTTPS.');
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    env: { ...process.env, EXPO_NO_DOTENV: '1' },
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options,
  });

  if (result.error) throw result.error;
  return result;
}

function findAdb() {
  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const sdkAdb = sdkRoot ? path.join(sdkRoot, 'platform-tools', 'adb') : null;
  if (sdkAdb && fs.existsSync(sdkAdb)) return sdkAdb;

  const result = run('sh', ['-c', 'command -v adb'], { capture: true });
  const adbPath = result.stdout?.trim();
  if (result.status === 0 && adbPath) return adbPath;

  throw new Error('ADB was not found. Install Android SDK Platform-Tools or set ANDROID_HOME.');
}

function getTargetDevice(adb) {
  const result = run(adb, ['devices'], { capture: true });
  if (result.status !== 0)
    throw new Error(result.stderr?.trim() || 'Could not list Android devices.');

  const devices = result.stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([, state]) => state === 'device')
    .map(([serial]) => serial);
  const requestedSerial = process.env.ANDROID_SERIAL?.trim();

  if (requestedSerial) {
    if (!devices.includes(requestedSerial)) {
      throw new Error(`ANDROID_SERIAL=${requestedSerial} is not connected or authorized.`);
    }
    return requestedSerial;
  }

  if (devices.length === 0) {
    throw new Error('No authorized Android device is connected. Check `adb devices`.');
  }
  if (devices.length > 1) {
    throw new Error(
      `Multiple Android devices are connected (${devices.join(', ')}). Set ANDROID_SERIAL first.`,
    );
  }

  return devices[0];
}

function buildRelease() {
  const gradlew = path.join(ANDROID_DIR, 'gradlew');
  if (!fs.existsSync(gradlew)) throw new Error('android/gradlew is missing.');

  // Do not restrict reactNativeArchitectures here. The resulting APK must contain every ABI
  // configured by the project so it can be shared instead of targeting one connected phone.
  // `--stacktrace` only prints on failure. Without it, an AGP worker crash such as
  // PackageAndroidArtifact$IncrementalSplitterRunnable reports no nested cause and is undebuggable.
  const gradleArgs = [
    ':app:assembleRelease',
    '--no-daemon',
    '--no-parallel',
    '--max-workers=4',
    '--stacktrace',
  ];
  const command = process.platform === 'darwin' ? 'caffeinate' : gradlew;
  const args = process.platform === 'darwin' ? ['-i', gradlew, ...gradleArgs] : gradleArgs;
  const result = run(command, args, { cwd: ANDROID_DIR });
  if (result.status !== 0)
    throw new Error(`Android Release build failed with code ${result.status}.`);
  if (!fs.existsSync(APK_PATH)) throw new Error(`Release APK was not created at ${APK_PATH}.`);
}

function installAndLaunch(adb, serial) {
  const install = run(adb, ['-s', serial, 'install', '-r', APK_PATH]);
  if (install.status !== 0) {
    throw new Error(
      'APK installation failed. If Android reports UPDATE_INCOMPATIBLE, the installed app uses a different signing key. Uninstall it manually only if you accept losing its local app data.',
    );
  }

  const launch = run(adb, [
    '-s',
    serial,
    'shell',
    'monkey',
    '-p',
    PACKAGE_NAME,
    '-c',
    'android.intent.category.LAUNCHER',
    '1',
  ]);
  if (launch.status !== 0) throw new Error('The APK installed, but LangEx could not be launched.');
}

function main() {
  loadProductionEnvironment();
  validateEnvironment();

  console.log('Building a shareable LangEx Android Release APK using the production API…');
  buildRelease();
  console.log(`Release APK created at ${APK_PATH}`);

  if (!process.argv.includes('--install')) return;

  const adb = findAdb();
  const serial = getTargetDevice(adb);
  console.log(`Installing ${APK_PATH}…`);
  installAndLaunch(adb, serial);
  console.log('LangEx Release was installed and launched successfully.');
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
