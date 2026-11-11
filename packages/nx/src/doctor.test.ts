import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runDoctor } from './doctor.js';

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('runDoctor', () => {
  it('fails clearly for missing paths', () => {
    const result = runDoctor({
      workspacePath: path.join(os.tmpdir(), 'does-not-exist-nx-uml-viewer'),
    });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'path-not-found')).toBe(true);
  });

  it('fails clearly for malformed nx.json', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nx-uml-viewer-bad-json-'));
    tempDirs.push(dir);
    fs.writeFileSync(path.join(dir, 'nx.json'), '{not json');
    fs.writeFileSync(path.join(dir, 'package.json'), '{}');

    const result = runDoctor({ workspacePath: dir });
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some((d) => d.code === 'malformed-nx-json')).toBe(true);
  });
});
