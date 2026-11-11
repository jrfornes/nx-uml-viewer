# Compatibility matrix

This matrix is updated from executable fixture evidence. Ranges describe intent;
`Verified in CI` lists versions actually exercised by tests in this repository.

## Runtime

| Component        | Supported range | Verified in CI | Notes                                               |
| ---------------- | --------------- | -------------- | --------------------------------------------------- |
| Node.js          | `>=20.19.0`     | `22.23.3`      | Minimum follows current Nx 23 requirements.         |
| Package managers | npm, pnpm, Yarn | pnpm           | npm/Yarn smoke coverage is planned for Milestone 8. |

## Workspace tools

| Component  | Supported range    | Verified in CI | Notes                                                                |
| ---------- | ------------------ | -------------- | -------------------------------------------------------------------- |
| Nx         | `>=20.0.0 <24.0.0` | `23.3.0`       | Project graph via public `@nx/devkit` `createProjectGraphAsync`.     |
| TypeScript | `>=5.4.0`          | `6.0.3`        | Uses the workspace-installed compiler API.                           |
| Angular    | `>=18.0.0`         | `22.1.0`       | Milestone 0 detects versions only; enrichment starts in Milestone 4. |

## Layouts

| Layout                           | Fixture                     | Verified |
| -------------------------------- | --------------------------- | -------- |
| Integrated Nx + Angular monorepo | `fixtures/nx-angular-basic` | yes      |
| Package-based Nx workspace       | _(planned)_                 | no       |

## Public Nx integration

| Capability      | API                                         | Status                        |
| --------------- | ------------------------------------------- | ----------------------------- |
| Project graph   | `@nx/devkit` `createProjectGraphAsync`      | verified on `23.3.0`          |
| Project listing | `readProjectsConfigurationFromProjectGraph` | verified on `23.3.0`          |
| Boundary policy | ESLint / Nx lint config readers             | not implemented (Milestone 5) |

## Risks

- Nx graph computation requires `node_modules` and sets `NX_DAEMON=false` during
  tests to avoid daemon coupling.
- pnpm workspaces may not hoist `@nx/devkit` to the root `node_modules`. The Nx
  adapter resolves the pnpm virtual store entry pinned to the installed `nx`
  version when a direct `@nx/devkit` import is unavailable.
- TypeScript 6.x alongside Angular 22.x is new; lower TypeScript 5.x lines are
  declared but not yet fixture-verified.
- Nx majors below 20 and 24+ are rejected by `doctor` until adapters are tested.
