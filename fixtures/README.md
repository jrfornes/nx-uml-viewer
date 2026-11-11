# Compatibility fixtures

Fixtures are real Nx workspaces used by integration tests. Each fixture keeps a
`pnpm-lock.yaml` pin; tests install dependencies on first run via
`vitest.global-setup.ts` or `pnpm fixtures:install`.

Do not run Nx generators against these directories during analysis tests. The
viewer must remain read-only with respect to inspected workspaces.

See `manifest.json` for pinned versions and `docs/compatibility-matrix.md` for
supported ranges verified in CI.
