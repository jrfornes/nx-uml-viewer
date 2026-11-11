import fs from 'node:fs';
import path from 'node:path';

export function resolveInputPath(inputPath: string): string {
  return path.resolve(inputPath);
}

/** Walk upward from `startPath` to find a directory containing `nx.json`. */
export function findNearestNxWorkspaceRoot(startPath: string): string | null {
  let current = path.resolve(startPath);
  const { root } = path.parse(current);
  const stat = fs.existsSync(current) ? fs.statSync(current) : null;
  if (stat?.isFile()) {
    current = path.dirname(current);
  }

  while (true) {
    const nxJson = path.join(current, 'nx.json');
    if (fs.existsSync(nxJson)) {
      return current;
    }
    if (current === root) {
      return null;
    }
    current = path.dirname(current);
  }
}

export function readJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
