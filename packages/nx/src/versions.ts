import fs from 'node:fs';
import path from 'node:path';

import {
  SUPPORTED_VERSION_MATRIX,
  type Diagnostic,
  type ToolVersions,
} from '@nx-uml-viewer/model';
import semver from 'semver';

import { detectPackageManager } from './package-manager.js';
import { readJsonFile } from './workspace-root.js';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function readInstalledVersion(
  workspaceRoot: string,
  packageName: string,
): string | undefined {
  const pkgJsonPath = path.join(
    workspaceRoot,
    'node_modules',
    packageName,
    'package.json',
  );
  if (!fs.existsSync(pkgJsonPath)) {
    return undefined;
  }
  const pkg = readJsonFile<{ version?: string }>(pkgJsonPath);
  return pkg?.version;
}

function readDeclaredVersion(
  workspacePackageJson: PackageJson,
  packageName: string,
): string | undefined {
  const range =
    workspacePackageJson.dependencies?.[packageName] ??
    workspacePackageJson.devDependencies?.[packageName];
  if (!range) {
    return undefined;
  }
  const coerced = semver.coerce(range);
  return coerced?.version;
}

export function collectToolVersions(workspaceRoot: string): ToolVersions {
  const rootPackageJson =
    readJsonFile<PackageJson>(path.join(workspaceRoot, 'package.json')) ?? {};

  const nx =
    readInstalledVersion(workspaceRoot, 'nx') ??
    readDeclaredVersion(rootPackageJson, 'nx');
  const typescript =
    readInstalledVersion(workspaceRoot, 'typescript') ??
    readDeclaredVersion(rootPackageJson, 'typescript');
  const angular =
    readInstalledVersion(workspaceRoot, '@angular/core') ??
    readDeclaredVersion(rootPackageJson, '@angular/core');

  return {
    node: process.version.replace(/^v/, ''),
    packageManager: detectPackageManager(workspaceRoot),
    nx,
    typescript,
    angular,
  };
}

export function validateSupportedVersions(versions: ToolVersions): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  const nodeSemver = semver.coerce(versions.node);
  if (!nodeSemver || semver.lt(nodeSemver, SUPPORTED_VERSION_MATRIX.node.min)) {
    diagnostics.push({
      code: 'unsupported-node',
      severity: 'error',
      message: `Node.js ${versions.node} is below the minimum supported version ${SUPPORTED_VERSION_MATRIX.node.min}.`,
      analyzer: 'doctor',
      recoverable: false,
    });
  }

  if (!versions.nx) {
    diagnostics.push({
      code: 'nx-not-found',
      severity: 'error',
      message:
        'Could not determine the Nx version. Install `nx` in the workspace and run the package manager install.',
      analyzer: 'doctor',
      recoverable: false,
    });
  } else {
    const nxSemver = semver.coerce(versions.nx);
    const supportedRange = SUPPORTED_VERSION_MATRIX.nx.max
      ? `>=${SUPPORTED_VERSION_MATRIX.nx.min} <24.0.0-0`
      : `>=${SUPPORTED_VERSION_MATRIX.nx.min}`;
    if (
      !nxSemver ||
      !semver.satisfies(nxSemver, supportedRange, { includePrerelease: true })
    ) {
      diagnostics.push({
        code: 'unsupported-nx',
        severity: 'error',
        message: `Nx ${versions.nx} is outside the supported range (${supportedRange}). See docs/compatibility-matrix.md.`,
        analyzer: 'doctor',
        recoverable: false,
      });
    }
  }

  if (versions.packageManager === 'unknown') {
    diagnostics.push({
      code: 'unknown-package-manager',
      severity: 'warning',
      message:
        'Could not detect npm, pnpm, Yarn, or Bun from lockfiles. Version detection may be incomplete.',
      analyzer: 'doctor',
      recoverable: true,
    });
  }

  return diagnostics;
}
