import { pathToFileURL } from 'node:url';

import type { NxProjectGraphFact } from '@nx-uml-viewer/model';

import type { NxCapabilities, NxWorkspaceAdapter } from './adapter-types.js';
import { resolveNxDevkitEntry } from './resolve-nx-devkit.js';
import { collectToolVersions } from './versions.js';

interface DevkitProjectGraphNode {
  name: string;
  type: string;
  data: {
    root: string;
    projectType?: string;
    tags?: string[];
  };
}

interface DevkitProjectGraph {
  nodes: Record<string, DevkitProjectGraphNode>;
  dependencies: Record<string, Array<{ target: string; type: string }>>;
}

interface DevkitModule {
  createProjectGraphAsync: (opts?: {
    exitOnError?: boolean;
    resetDaemonClient?: boolean;
  }) => Promise<DevkitProjectGraph>;
  readProjectsConfigurationFromProjectGraph: (graph: DevkitProjectGraph) => {
    projects: Record<
      string,
      { root: string; projectType?: string; tags?: string[]; name?: string }
    >;
  };
}

async function loadDevkit(workspaceRoot: string): Promise<DevkitModule> {
  const devkitEntry = resolveNxDevkitEntry(workspaceRoot);
  const moduleUrl = pathToFileURL(devkitEntry).href;
  return (await import(moduleUrl)) as DevkitModule;
}

export async function createNxWorkspaceAdapter(
  workspaceRoot: string,
): Promise<NxWorkspaceAdapter> {
  const versions = collectToolVersions(workspaceRoot);
  let devkit: DevkitModule;
  try {
    devkit = await loadDevkit(workspaceRoot);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to load @nx/devkit from ${workspaceRoot}. Run the workspace package manager install first. (${message})`,
    );
  }

  if (typeof devkit.createProjectGraphAsync !== 'function') {
    throw new Error(
      'The installed @nx/devkit does not export createProjectGraphAsync. This Nx version is not supported.',
    );
  }

  const capabilities: NxCapabilities = {
    devkitProjectGraph: true,
    nxVersion: versions.nx,
  };

  return {
    capabilities(): NxCapabilities {
      return capabilities;
    },

    async readProjectGraph(): Promise<NxProjectGraphFact> {
      const previousCwd = process.cwd();
      process.chdir(workspaceRoot);
      try {
        process.env.NX_DAEMON = 'false';
        const graph = await devkit.createProjectGraphAsync({
          exitOnError: false,
          resetDaemonClient: true,
        });
        const projectsConfig = devkit.readProjectsConfigurationFromProjectGraph(graph);

        const projects = Object.entries(projectsConfig.projects).map(
          ([name, project]) => ({
            name,
            root: project.root,
            projectType: project.projectType,
            tags: project.tags ?? [],
          }),
        );

        const dependencies: NxProjectGraphFact['dependencies'] = [];
        for (const [source, deps] of Object.entries(graph.dependencies)) {
          for (const dep of deps) {
            dependencies.push({
              source,
              target: dep.target,
              type: dep.type,
            });
          }
        }

        return { projects, dependencies };
      } finally {
        process.chdir(previousCwd);
      }
    },
  };
}
