#!/usr/bin/env node
import { Command } from 'commander';

import { runDoctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('nx-uml-viewer')
  .description('Architecture explorer for Nx workspaces')
  .version('0.0.0');

program
  .command('doctor')
  .description('Validate an Nx workspace and report tool versions')
  .argument('[workspace]', 'Path inside or to the workspace', process.cwd())
  .option('--json', 'Print structured JSON diagnostics')
  .action((workspace: string, options: { json?: boolean }) => {
    const exitCode = runDoctorCommand({ workspace, json: options.json });
    process.exitCode = exitCode;
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
