import { z } from 'zod';

export const PackageManagerSchema = z.enum(['npm', 'pnpm', 'yarn', 'bun', 'unknown']);

export const ToolVersionsSchema = z.object({
  node: z.string(),
  packageManager: PackageManagerSchema,
  nx: z.string().optional(),
  typescript: z.string().optional(),
  angular: z.string().optional(),
});

export type ToolVersions = z.infer<typeof ToolVersionsSchema>;

export const SupportedVersionMatrixSchema = z.object({
  node: z.object({
    min: z.string(),
    max: z.string().optional(),
    verified: z.array(z.string()),
  }),
  nx: z.object({
    min: z.string(),
    max: z.string().optional(),
    verified: z.array(z.string()),
  }),
  typescript: z.object({
    min: z.string(),
    max: z.string().optional(),
    verified: z.array(z.string()),
  }),
  angular: z.object({
    min: z.string(),
    max: z.string().optional(),
    verified: z.array(z.string()),
  }),
});

export type SupportedVersionMatrix = z.infer<typeof SupportedVersionMatrixSchema>;

/** Declared support ranges; CI verifies entries listed in `verified`. */
export const SUPPORTED_VERSION_MATRIX: SupportedVersionMatrix = {
  node: {
    min: '20.19.0',
    verified: ['22.23.3'],
  },
  nx: {
    min: '20.0.0',
    max: '23.x',
    verified: ['23.3.0'],
  },
  typescript: {
    min: '5.4.0',
    verified: ['6.0.3'],
  },
  angular: {
    min: '18.0.0',
    verified: ['22.1.0'],
  },
};
