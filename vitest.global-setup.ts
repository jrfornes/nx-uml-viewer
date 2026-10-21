import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(repoRoot, 'fixtures');

function installFixture(name: string): void {
  const fixtureRoot = path.join(fixturesRoot, name);
  const nodeModules = path.join(fixtureRoot, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    return;
  }
  const lockfile = path.join(fixtureRoot, 'pnpm-lock.yaml');
  if (!fs.existsSync(lockfile)) {
    throw new Error(`Missing pnpm-lock.yaml for fixture ${name}`);
  }
  execSync('pnpm install --frozen-lockfile', {
    cwd: fixtureRoot,
    stdio: 'inherit',
  });
}

export default function setup(): void {
  execSync('pnpm exec tsc -b tsconfig.build.json', {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (!fs.existsSync(fixturesRoot)) {
    return;
  }
  for (const entry of fs.readdirSync(fixturesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.startsWith('.')) {
      continue;
    }
    installFixture(entry.name);
  }
}
