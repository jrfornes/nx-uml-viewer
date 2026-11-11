export type { NxCapabilities, NxWorkspaceAdapter } from './adapter-types.js';
export { createNxWorkspaceAdapter } from './create-nx-adapter.js';
export { runDoctor, type RunDoctorOptions } from './doctor.js';
export { detectPackageManager } from './package-manager.js';
export { collectToolVersions, validateSupportedVersions } from './versions.js';
export {
  findNearestNxWorkspaceRoot,
  resolveInputPath,
  readJsonFile,
} from './workspace-root.js';
