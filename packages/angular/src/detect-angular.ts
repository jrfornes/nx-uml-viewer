import type { ToolVersions } from '@nx-uml-viewer/model';

export interface AngularCapabilities {
  detected: boolean;
  version?: string;
}

export function detectAngularCapabilities(
  versions: Pick<ToolVersions, 'angular'>,
): AngularCapabilities {
  if (!versions.angular) {
    return { detected: false };
  }
  return { detected: true, version: versions.angular };
}
