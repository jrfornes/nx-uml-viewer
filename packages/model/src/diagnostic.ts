import { z } from 'zod';

export const DiagnosticSeveritySchema = z.enum(['info', 'warning', 'error']);

export const DiagnosticSchema = z.object({
  code: z.string(),
  severity: DiagnosticSeveritySchema,
  message: z.string(),
  analyzer: z.string(),
  recoverable: z.boolean(),
  location: z
    .object({
      file: z.string(),
      line: z.number().int().positive().optional(),
      column: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export type Diagnostic = z.infer<typeof DiagnosticSchema>;
