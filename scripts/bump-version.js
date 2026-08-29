/* global __dirname */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const packagePath = path.join(projectRoot, 'package.json');
const appConfigPath = path.join(projectRoot, 'app.json');

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
const nextVersion = packageJson.version;

if (!/^\d+\.\d+\.\d+$/.test(nextVersion)) {
  console.error(`Expected a semantic version like 1.2.3, received ${nextVersion}.`);
  process.exit(1);
}

appConfig.expo.version = nextVersion;
fs.writeFileSync(appConfigPath, `${JSON.stringify(appConfig, null, 2)}\n`);
execFileSync('git', ['add', 'app.json'], { cwd: projectRoot, stdio: 'inherit' });

console.log(`Synchronized Expo app version at ${nextVersion}.`);
