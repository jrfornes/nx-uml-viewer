import { z } from 'zod';

/** Framework-independent Nx project facts (Milestone 0 spike shape). */
export const NxProjectFactSchema = z.object({
  name: z.string(),
  root: z.string(),
  projectType: z.string().optional(),
  tags: z.array(z.string()),
});

export const NxProjectGraphFactSchema = z.object({
  projects: z.array(NxProjectFactSchema),
  dependencies: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      type: z.string(),
    }),
  ),
});

export type NxProjectFact = z.infer<typeof NxProjectFactSchema>;
export type NxProjectGraphFact = z.infer<typeof NxProjectGraphFactSchema>;
