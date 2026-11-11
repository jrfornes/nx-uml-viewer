import { detectAngularCapabilities } from '@nx-uml-viewer/angular';
import { DoctorResultSchema } from '@nx-uml-viewer/model';
import { runDoctor } from '@nx-uml-viewer/nx';

export interface DoctorCommandOptions {
  workspace?: string;
  json?: boolean;
}

export function runDoctorCommand(options: DoctorCommandOptions): number {
  const workspacePath = options.workspace ?? process.cwd();
  const result = runDoctor({ workspacePath });

  if (options.json) {
    process.stdout.write(
      `${JSON.stringify(DoctorResultSchema.parse(result), null, 2)}\n`,
    );
  } else {
    printDoctorHuman(result);
  }

  return result.ok ? 0 : 1;
}

function printDoctorHuman(result: ReturnType<typeof runDoctor>): void {
  if (result.workspaceRoot) {
    console.log(`Workspace: ${result.workspaceRoot}`);
  }
  if (result.versions) {
    console.log('Versions:');
    console.log(`  node: ${result.versions.node}`);
    console.log(`  packageManager: ${result.versions.packageManager}`);
    if (result.versions.nx) console.log(`  nx: ${result.versions.nx}`);
    if (result.versions.typescript)
      console.log(`  typescript: ${result.versions.typescript}`);
    const angular = detectAngularCapabilities(result.versions);
    if (angular.detected) {
      console.log(`  angular: ${angular.version}`);
    }
  }
  if (result.diagnostics.length > 0) {
    console.log('Diagnostics:');
    for (const diagnostic of result.diagnostics) {
      console.log(
        `  [${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`,
      );
    }
  }
  console.log(result.ok ? 'Status: ok' : 'Status: failed');
}
