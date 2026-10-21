import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    testTimeout: 120_000,
    hookTimeout: 300_000,
    globalSetup: ['./vitest.global-setup.ts'],
  },
});
