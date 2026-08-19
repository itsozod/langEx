#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ENV_FILE = path.resolve(process.cwd(), '.env.production.local');

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

function build() {
  if (process.platform !== 'darwin') {
    throw new Error('A local iOS device build requires macOS and Xcode.');
  }

  loadProductionEnvironment();
  validateEnvironment();

  const child = spawn(
    'caffeinate',
    ['-i', 'npx', 'expo', 'run:ios', '--device', '--configuration', 'Release'],
    {
      stdio: 'inherit',
      env: { ...process.env, EXPO_NO_DOTENV: '1' },
    },
  );

  child.on('error', (error) => {
    console.error(`Could not start the iOS release build: ${error.message}`);
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      console.error(`iOS release build stopped by signal ${signal}.`);
      process.exitCode = 1;
      return;
    }
    process.exitCode = code ?? 1;
  });
}

try {
  build();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
