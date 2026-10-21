# Implementation plan

## Delivery strategy

Build thin vertical slices. Each milestone must produce a runnable command and
an inspectable output. Avoid building a complete analyzer before proving the
graph can be queried and displayed.

The milestone order is intentional: stable identity and evidence precede rich
rendering, and workspace facts precede Angular inference.

## Milestone 0: Bootstrap and compatibility spike

### Work

- Create the package workspace and shared TypeScript configuration.
- Add formatting, linting, unit testing, build, and type-check commands.
- Use the current stable releases when dependencies are first installed.
- Select a minimum Node.js version based on the supported Nx range.
- Build small fixture workspaces covering current Nx Angular layouts.
- Prototype Nx project discovery using only supported public APIs.
- Prototype TypeScript program creation using each fixture's configuration.
- Record the initial compatibility matrix in documentation and CI.
- Add architecture dependency checks between packages.

### Exit criteria

- One command runs formatting checks, lint, type-checking, and unit tests.
- `doctor` locates each fixture and reports Nx, TypeScript, and Angular versions.
- The spike can list projects and compile a TypeScript program from fixtures.
- Unsupported versions fail with an actionable message.
- Decisions discovered by the spike are reflected in the knowledge documents.

## Milestone 1: Canonical model and headless Nx graph

### Work

- Implement runtime schemas and TypeScript types for nodes, edges, evidence,
  findings, diagnostics, and source locations.
- Implement deterministic ID construction and path normalization.
- Implement graph validation and immutable snapshot revisioning.
- Build the Nx adapter and normalize projects and dependencies.
- Implement tag-prefix grouping and project-edge aggregation.
- Add `analyze --output` to write versioned JSON.
- Add `doctor` diagnostics for malformed roots and incompatible workspaces.

### Exit criteria

- The CLI emits a schema-valid project graph for all fixtures.
- Output is byte-stable for repeated analysis of unchanged fixtures, excluding
  explicitly documented timestamps.
- Every Nx dependency has provenance.
- Project IDs remain stable across machines and path separators.
- A 500-project synthetic fixture stays within the agreed analysis budget.

## Milestone 2: TypeScript module analysis

### Work

- Resolve project tsconfigs and create reusable TypeScript programs.
- Assign source files to Nx projects.
- Extract static, type-only, dynamic, and re-export relationships.
- Resolve relative paths, path aliases, package exports, and project references.
- Create module and external-package nodes.
- Attach source ranges and import specifiers as evidence.
- Add module cycles and project rollups.
- Implement project-scoped, on-demand analysis.

### Exit criteria

- Fixture expectations cover aliases, barrels, secondary entry points,
  dynamic imports, type imports, and unresolved imports.
- Every displayed module edge opens concrete evidence.
- Rolled-up module edges identify all represented module edges.
- Tests prove comments and string literals do not create relationships.
- Opening one project does not require parsing every unrelated project.

## Milestone 3: Minimal interactive viewer

### Work

- Start a loopback HTTP service from the CLI.
- Define and validate versioned API DTOs.
- Build the browser shell, error state, and session information.
- Render grouped Nx projects and aggregate dependencies.
- Add pan, zoom, selection, keyboard navigation, and fit-to-view.
- Add an inspector for node metadata, edge evidence, and diagnostics.
- Drill from group to project and from project to modules.
- Add filters for tags, edge kinds, external packages, and findings.
- Add source preview and safe editor-link integration.

### Exit criteria

- Running `nx-uml-viewer` in a fixture opens a useful project diagram.
- A user can drill to a module import and open its source location.
- All views remain usable with keyboard-only navigation.
- The service rejects path traversal and binds to loopback by default.
- The project-level 500-node performance fixture meets interaction budgets.

## Milestone 4: Angular enrichment

### Work

- Add Angular capability and version detection.
- Implement Angular adapter boundaries.
- Recognize Angular declarations and retain their source symbols.
- Analyze standalone imports and NgModule relationships.
- Analyze constructor injection and `inject(...)`.
- Analyze eager and lazy route targets.
- Display Angular symbol cards and semantic edge kinds.
- Degrade to TypeScript-only analysis when Angular enrichment fails.

### Exit criteria

- Fixtures cover standalone and NgModule applications.
- Fixtures cover lazy routes, functional providers, guards, and interceptors.
- Angular semantic edges retain TypeScript or compiler evidence.
- An unsupported Angular construct emits a scoped diagnostic.
- Disabling Angular enrichment produces a valid TypeScript graph.

## Milestone 5: Policy and architecture findings

### Work

- Normalize supported Nx module-boundary constraints.
- Evaluate project dependencies against normalized constraints.
- Add cycle, orphan, and forbidden-dependency findings.
- Add optional viewer-defined architectural levels.
- Render violations without changing observed edge kinds.
- Explain findings with rule identity, source configuration, and imports.
- Add an exportable machine-readable findings report.

### Exit criteria

- Policy fixtures are checked against actual Nx lint outcomes where possible.
- Each red aggregate edge identifies its violating member edges.
- Unsupported dynamic lint configuration is reported, not approximated silently.
- Viewer policy and Nx policy findings are distinguishable.
- Headless analysis can fail CI on configured severities.

## Milestone 6: Incremental analysis and persistence

### Work

- Add classified, debounced workspace watching.
- Cache Nx, TypeScript, and Angular facts with explicit versions.
- Rebuild only affected programs and reverse dependents.
- Publish atomic graph revisions and browser update events.
- Persist UI preferences and sessions.
- Add cache inspection and clearing commands.

### Exit criteria

- Editing a source import updates the visible graph without restart.
- Policy-only changes do not reparse TypeScript.
- Configuration changes invalidate the correct caches.
- Killing the server cannot leave a cache that validates as complete.
- Cache corruption recovers automatically with a diagnostic.

## Milestone 7: Proposals

### Work

- Add proposal schemas and storage.
- Create, rename, clone, and delete proposals.
- Assign project or module nodes to conceptual groups.
- Recalculate proposal-level dependency direction and findings.
- Compare proposal and real views.
- Reconcile proposals after the workspace revision changes.
- Export and import proposals.

### Exit criteria

- The UI always marks proposal views as hypothetical.
- Proposals never modify source or Nx configuration.
- Missing and newly unassigned nodes are reported after source changes.
- Aggregate edges remain explainable in proposal views.
- Proposal files are schema-versioned and portable across machines.

## Milestone 8: Packaging and release hardening

### Work

- Package the executable for `npx` use without global installation.
- Verify npm, pnpm, and Yarn workspace behavior.
- Add startup telemetry only if explicitly designed as opt-in; otherwise none.
- Produce install, CLI, compatibility, troubleshooting, and contribution docs.
- Add release automation, changelog generation, and provenance.
- Run accessibility, security, and performance reviews.
- Validate clean installation against external sample workspaces.

### Exit criteria

- The package runs from an unmodified supported Nx workspace.
- Installation and first run do not invoke workspace generators or builds.
- Published files contain no fixtures, caches, or development secrets.
- Compatibility claims match automated test coverage.
- A new contributor can build and test from the documented instructions.

## Parallel workstreams

Once Milestone 1 establishes the model, these can proceed concurrently:

- TypeScript analysis and browser graph rendering.
- Fixture development and compatibility testing.
- Layout experiments using generated graph DTOs.
- Documentation and diagnostic-message design.

Angular enrichment depends on TypeScript symbol identity. Policy visualization
depends on canonical findings. Proposal implementation depends on stable IDs
and graph revisions.

## Definition of done for every milestone

- Public behavior is covered by tests.
- Runtime input boundaries are validated.
- New diagnostics include remediation guidance.
- Performance-sensitive work has a measured fixture.
- User-facing and architectural documentation is updated.
- No package violates the dependency direction in `architecture.md`.
- The feature works against a fixture through the public CLI or API, not only
  through unit-level internals.

## Initial backlog

The first implementation iteration should produce these issues:

1. Bootstrap package workspace and quality commands.
2. Create Nx/Angular fixture generator and committed minimal fixtures.
3. Implement workspace-root detection and `doctor`.
4. Validate public Nx graph APIs across the proposed version matrix.
5. Define graph runtime schemas and stable IDs.
6. Emit the first headless Nx project graph.
7. Establish deterministic golden-file testing.
8. Add the first synthetic performance fixture.
