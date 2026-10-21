import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { NxProjectGraphFactSchema } from '@nx-uml-viewer/model';

import { createNxWorkspaceAdapter } from './create-nx-adapter.js';
import { runDoctor } from './doctor.js';

const repoRoot = path.dirname(
  path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url)))),
);
const basicFixture = path.join(repoRoot, 'fixtures', 'nx-angular-basic');

describe('Nx public API spike (fixture)', () => {
  it('doctor reports fixture versions', () => {
    const result = runDoctor({ workspacePath: basicFixture });
    expect(result.ok).toBe(true);
    expect(result.versions?.nx).toBe('23.3.0');
    expect(result.versions?.packageManager).toBe('pnpm');
    expect(result.versions?.typescript).toMatch(/^6\./);
    expect(result.versions?.angular).toMatch(/^22\./);
  });

  it('lists projects and dependencies via createProjectGraphAsync', async () => {
    const adapter = await createNxWorkspaceAdapter(basicFixture);
    expect(adapter.capabilities().devkitProjectGraph).toBe(true);

    const graph = await adapter.readProjectGraph();
    const parsed = NxProjectGraphFactSchema.parse(graph);
    expect(parsed.projects.some((p) => p.name === 'demo')).toBe(true);
    expect(parsed.projects.length).toBeGreaterThan(0);
  });
});
