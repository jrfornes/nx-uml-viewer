# Testing strategy

## Objectives

Tests must establish semantic correctness, compatibility, explainability,
security, and performance. Snapshotting a visually plausible graph is not
enough: each relationship needs evidence and each policy finding needs a rule.

## Test layers

### Pure unit tests

Cover:

- ID and path normalization;
- schema validation and migrations;
- graph merge and aggregation;
- strongly connected components;
- grouping and projection;
- proposal reconciliation;
- policy evaluation;
- diagnostic formatting.

These tests have no Nx, TypeScript, Angular, filesystem, network, or browser
dependency.

### Analyzer fixture tests

Use minimal committed workspaces that represent one behavior each:

- integrated and package-based Nx layouts;
- relative and aliased imports;
- barrels and secondary entry points;
- project references;
- runtime, type-only, and dynamic imports;
- standalone Angular and NgModule applications;
- injection and lazy routes;
- Nx tag constraints;
- malformed and unsupported configurations.

Assertions should target normalized facts and evidence, not private compiler
objects.

### Golden graph tests

Headless analysis produces canonical JSON with sorted keys and stable arrays.
Reviewable golden files catch accidental semantic changes. Volatile values are
excluded from the canonical format.

A golden update requires explaining why facts changed. It must not be an
automatic consequence of changing parser code.

### Nx parity tests

For supported boundary-policy forms, run the appropriate Nx lint command in
fixtures and compare its violations with normalized viewer findings. Exact
message text need not match; subjects and rule outcomes must.

Project graph parity tests compare normalized project dependencies with Nx's
public graph result before TypeScript enrichment.

### API and security tests

Test:

- DTO validation and API versioning;
- path traversal and symlink escape attempts;
- source file size and request limits;
- loopback binding defaults;
- malformed cache and proposal files;
- escaping of labels and source;
- behavior when workspace files disappear during a request.

### Browser tests

Automated browser tests cover:

- loading, empty, partial, and error states;
- drill-down and back navigation;
- pan, zoom, fit, search, and filters;
- edge evidence inspection;
- source preview and editor links;
- keyboard navigation and focus order;
- proposal warnings and comparison;
- live update after a fixture file changes.

Prefer semantic selectors and accessibility roles over layout coordinates.

### Visual regression tests

Keep a small set of deterministic graphs for:

- dense project dependencies;
- cycles and bidirectional edges;
- long labels;
- groups with no dependencies;
- violation highlighting;
- dark and light themes.

Visual snapshots supplement semantic browser assertions; they do not replace
them.

## Compatibility matrix

CI runs representative combinations from the documented support matrix rather
than every Cartesian product. Include:

- lowest and newest supported Node.js;
- lowest and newest supported Nx;
- lowest and newest compatible TypeScript and Angular per Nx line;
- npm and pnpm on regular CI;
- Yarn in at least one release-gating job;
- Linux as the main platform plus path-specific tests on Windows.

Compatibility fixture manifests are pinned. A scheduled dependency job may
test newest versions without silently changing release claims.

## Performance tests

Generated fixtures provide repeatable sizes:

- 500 projects and 3,000 project dependencies;
- 10,000 TypeScript modules;
- one highly connected project;
- one large strongly connected component;
- aggregate edges with thousands of evidence entries.

Measure:

- cold project graph analysis;
- selected-project TypeScript analysis;
- single-file incremental update;
- project-view payload size;
- first useful render;
- pan, zoom, selection, and filter responsiveness;
- memory after repeated updates.

Budgets are established from Milestones 1–3 on CI-class hardware and checked
for regressions. Avoid absolute promises until those baselines exist.

## Property and fuzz testing

Property tests are valuable for:

- path normalization never escaping the workspace;
- aggregation preserving every member edge exactly once;
- projection never producing dangling endpoints;
- stable IDs under input ordering changes;
- proposal reconciliation remaining deterministic;
- cycle results remaining invariant under node ordering.

Fuzz runtime schemas and API inputs. TypeScript syntax fuzzing should focus on
analyzer robustness, but TypeScript's own parser remains the syntax authority.

## Mutation and coverage

Set meaningful coverage thresholds for pure model and policy packages. Do not
use one repository-wide percentage that rewards UI boilerplate. Mutation
testing is most valuable for policy rules, aggregation, and graph algorithms
and can be introduced after those packages stabilize.

## Test data rules

- Fixtures contain no credentials or proprietary workspace source.
- Keep minimal fixtures readable; generate scale fixtures during tests.
- Never depend on a developer's global Nx or TypeScript installation.
- Avoid network access in ordinary tests.
- Record expected diagnostics explicitly.

## Release gates

A release requires:

- unit, fixture, golden, API, and browser tests passing;
- supported compatibility jobs passing;
- no unreviewed golden changes;
- no regression beyond agreed performance budgets;
- package smoke tests in clean temporary workspaces;
- documentation matching actual CLI flags and compatibility.
