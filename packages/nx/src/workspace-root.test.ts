import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { findNearestNxWorkspaceRoot } from './workspace-root.js';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function makeTempWorkspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nx-uml-viewer-'));
  tempDirs.push(dir);
  fs.writeFileSync(path.join(dir, 'nx.json'), '{}');
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  return dir;
}

describe('findNearestNxWorkspaceRoot', () => {
  it('finds nx.json from a nested file path', () => {
    const root = makeTempWorkspace();
    const nested = path.join(root, 'apps', 'demo', 'src');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'main.ts'), 'export {};');

    expect(findNearestNxWorkspaceRoot(nested)).toBe(root);
    expect(findNearestNxWorkspaceRoot(path.join(nested, 'main.ts'))).toBe(root);
  });

  it('returns null when no nx.json exists', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nx-uml-viewer-no-nx-'));
    tempDirs.push(dir);
    expect(findNearestNxWorkspaceRoot(dir)).toBeNull();
  });
});
