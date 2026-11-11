import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

export function resolveNxDevkitEntry(workspaceRoot: string): string {
  const require = createRequire(path.join(workspaceRoot, 'package.json'));

  try {
    return require.resolve('@nx/devkit');
  } catch {
    // pnpm isolates transitive dependencies; locate the devkit copy pinned with nx.
    const nxPackageJsonPath = require.resolve('nx/package.json');
    const nxPackage = JSON.parse(fs.readFileSync(nxPackageJsonPath, 'utf8')) as {
      version: string;
    };
    const nxVersion = nxPackage.version;
    const pnpmRoot = path.join(workspaceRoot, 'node_modules', '.pnpm');
    if (!fs.existsSync(pnpmRoot)) {
      throw new Error('@nx/devkit is not installed in this workspace.');
    }

    const prefix = `@nx+devkit@${nxVersion}`;
    const match = fs
      .readdirSync(pnpmRoot)
      .find((entry) => entry.startsWith(prefix) && entry.includes('_nx@'));

    if (!match) {
      throw new Error(
        `@nx/devkit@${nxVersion} was not found for nx@${nxVersion}. Add @nx/devkit to the workspace or run install.`,
      );
    }

    const devkitRoot = path.join(pnpmRoot, match, 'node_modules', '@nx', 'devkit');
    const packageJson = path.join(devkitRoot, 'package.json');
    if (!fs.existsSync(packageJson)) {
      throw new Error(`Resolved pnpm path is missing @nx/devkit: ${devkitRoot}`);
    }

    const devkitPkg = JSON.parse(fs.readFileSync(packageJson, 'utf8')) as {
      exports?: Record<string, string | { default?: string }>;
      main?: string;
    };
    const exportRoot = devkitPkg.exports?.['.'];
    if (typeof exportRoot === 'string') {
      return path.join(devkitRoot, exportRoot);
    }
    if (exportRoot && typeof exportRoot === 'object' && exportRoot.default) {
      return path.join(devkitRoot, exportRoot.default);
    }
    if (devkitPkg.main) {
      return path.join(devkitRoot, devkitPkg.main);
    }
    return path.join(devkitRoot, 'index.js');
  }
}
