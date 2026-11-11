import fs from 'node:fs';
import path from 'node:path';

import type { ToolVersions } from '@nx-uml-viewer/model';

export function detectPackageManager(
  workspaceRoot: string,
): ToolVersions['packageManager'] {
  if (fs.existsSync(path.join(workspaceRoot, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(workspaceRoot, 'yarn.lock'))) {
    return 'yarn';
  }
  if (
    fs.existsSync(path.join(workspaceRoot, 'bun.lockb')) ||
    fs.existsSync(path.join(workspaceRoot, 'bun.lock'))
  ) {
    return 'bun';
  }
  if (fs.existsSync(path.join(workspaceRoot, 'package-lock.json'))) {
    return 'npm';
  }
  return 'unknown';
}
