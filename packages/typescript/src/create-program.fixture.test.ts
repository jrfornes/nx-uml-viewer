import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { createTypeScriptProgramForProject } from './create-program.js';

const repoRoot = path.dirname(
  path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url)))),
);
const basicFixture = path.join(repoRoot, 'fixtures', 'nx-angular-basic');
const demoProjectRoot = path.join(basicFixture, 'apps', 'demo');

describe('TypeScript program spike (fixture)', () => {
  it('creates a program from the demo app tsconfig', () => {
    const result = createTypeScriptProgramForProject(basicFixture, demoProjectRoot);
    expect(result.configFile).toMatch(/tsconfig(\.app)?\.json$/);
    expect(result.sourceFileCount).toBeGreaterThan(0);
    expect(result.compilerVersion).toMatch(/^6\./);
  });
});
