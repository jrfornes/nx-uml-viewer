import { z } from 'zod';

import { DiagnosticSchema } from './diagnostic.js';
import { ToolVersionsSchema } from './versions.js';

export const DoctorResultSchema = z.object({
  ok: z.boolean(),
  workspaceRoot: z.string().optional(),
  requestedPath: z.string(),
  versions: ToolVersionsSchema.optional(),
  diagnostics: z.array(DiagnosticSchema),
});

export type DoctorResult = z.infer<typeof DoctorResultSchema>;
