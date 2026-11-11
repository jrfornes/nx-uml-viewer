import type { NxProjectGraphFact } from '@nx-uml-viewer/model';

export interface NxCapabilities {
  devkitProjectGraph: boolean;
  nxVersion?: string;
}

export interface NxWorkspaceAdapter {
  capabilities(): NxCapabilities;
  readProjectGraph(): Promise<NxProjectGraphFact>;
}
