import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

export interface TypeScriptProgramResult {
  projectRoot: string;
  configFile: string;
  sourceFileCount: number;
  compilerVersion: string;
}

type TsModule = typeof import('typescript');

function loadTypeScriptFromWorkspace(workspaceRoot: string): TsModule {
  const require = createRequire(path.join(workspaceRoot, 'package.json'));
  return require('typescript') as TsModule;
}

function findProjectTsConfig(projectRoot: string): string | null {
  const candidates = ['tsconfig.app.json', 'tsconfig.lib.json', 'tsconfig.json'];
  for (const name of candidates) {
    const candidate = path.join(projectRoot, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function createTypeScriptProgramForProject(
  workspaceRoot: string,
  projectRoot: string,
): TypeScriptProgramResult {
  const ts = loadTypeScriptFromWorkspace(workspaceRoot);
  const configFile = findProjectTsConfig(projectRoot);
  if (!configFile) {
    throw new Error(`No tsconfig found under ${projectRoot}`);
  }

  const configPath = ts.findConfigFile(
    projectRoot,
    (fileName) => ts.sys.fileExists(fileName),
    path.basename(configFile),
  );
  if (!configPath) {
    throw new Error(`TypeScript could not resolve config for ${projectRoot}`);
  }

  const readResult = ts.readConfigFile(configPath, (fileName) =>
    ts.sys.readFile(fileName),
  );
  if (readResult.error) {
    throw new Error(
      ts.formatDiagnostic(readResult.error, {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: () => workspaceRoot,
        getNewLine: () => '\n',
      }),
    );
  }

  const parsed = ts.parseJsonConfigFileContent(
    readResult.config,
    ts.sys,
    path.dirname(configPath),
  );
  if (parsed.errors.length > 0) {
    const message = parsed.errors
      .map((error) =>
        ts.formatDiagnostic(error, {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: () => workspaceRoot,
          getNewLine: () => '\n',
        }),
      )
      .join('\n');
    throw new Error(message);
  }

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });

  return {
    projectRoot,
    configFile: path.relative(workspaceRoot, configPath),
    sourceFileCount: program.getSourceFiles().filter((file) => !file.isDeclarationFile)
      .length,
    compilerVersion: ts.version,
  };
}
