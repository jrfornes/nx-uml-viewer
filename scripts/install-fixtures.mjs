import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixturesRoot = path.join(repoRoot, 'fixtures');

for (const entry of fs.readdirSync(fixturesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('.')) {
    continue;
  }
  const fixtureRoot = path.join(fixturesRoot, entry.name);
  if (!fs.existsSync(path.join(fixtureRoot, 'pnpm-lock.yaml'))) {
    console.warn(`Skipping ${entry.name}: no pnpm-lock.yaml`);
    continue;
  }
  console.log(`Installing fixture ${entry.name}...`);
  execSync('pnpm install --frozen-lockfile', { cwd: fixtureRoot, stdio: 'inherit' });
}
