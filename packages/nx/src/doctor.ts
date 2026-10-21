import fs from 'node:fs';
import path from 'node:path';

import {
  DoctorResultSchema,
  type Diagnostic,
  type DoctorResult,
} from '@nx-uml-viewer/model';

import { findNearestNxWorkspaceRoot, resolveInputPath } from './workspace-root.js';
import { collectToolVersions, validateSupportedVersions } from './versions.js';

export interface RunDoctorOptions {
  workspacePath: string;
}

export function runDoctor(options: RunDoctorOptions): DoctorResult {
  const requestedPath = resolveInputPath(options.workspacePath);
  const diagnostics: Diagnostic[] = [];

  if (!fs.existsSync(requestedPath)) {
    diagnostics.push({
      code: 'path-not-found',
      severity: 'error',
      message: `Path does not exist: ${requestedPath}`,
      analyzer: 'doctor',
      recoverable: false,
    });
    return DoctorResultSchema.parse({
      ok: false,
      requestedPath,
      diagnostics,
    });
  }

  const workspaceRoot = findNearestNxWorkspaceRoot(requestedPath);
  if (!workspaceRoot) {
    diagnostics.push({
      code: 'nx-workspace-not-found',
      severity: 'error',
      message:
        'No nx.json was found in this path or any parent directory. Point the CLI at an Nx workspace root or a file inside one.',
      analyzer: 'doctor',
      recoverable: false,
    });
    return DoctorResultSchema.parse({
      ok: false,
      requestedPath,
      diagnostics,
    });
  }

  const nxJsonPath = path.join(workspaceRoot, 'nx.json');
  try {
    JSON.parse(fs.readFileSync(nxJsonPath, 'utf8'));
  } catch {
    diagnostics.push({
      code: 'malformed-nx-json',
      severity: 'error',
      message: `Could not parse ${path.relative(workspaceRoot, nxJsonPath) || 'nx.json'} as JSON.`,
      analyzer: 'doctor',
      recoverable: false,
      location: { file: 'nx.json' },
    });
    return DoctorResultSchema.parse({
      ok: false,
      requestedPath,
      workspaceRoot,
      diagnostics,
    });
  }

  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    diagnostics.push({
      code: 'missing-package-json',
      severity: 'error',
      message: 'The workspace root is missing package.json.',
      analyzer: 'doctor',
      recoverable: false,
    });
    return DoctorResultSchema.parse({
      ok: false,
      requestedPath,
      workspaceRoot,
      diagnostics,
    });
  }

  const nodeModules = path.join(workspaceRoot, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    diagnostics.push({
      code: 'missing-node-modules',
      severity: 'error',
      message:
        'node_modules is missing. Run the workspace package manager install before using nx-uml-viewer.',
      analyzer: 'doctor',
      recoverable: false,
    });
  }

  const versions = collectToolVersions(workspaceRoot);
  diagnostics.push(...validateSupportedVersions(versions));

  const ok = !diagnostics.some((d) => d.severity === 'error');
  return DoctorResultSchema.parse({
    ok,
    requestedPath,
    workspaceRoot,
    versions,
    diagnostics,
  });
}
