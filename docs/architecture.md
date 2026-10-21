# System architecture

## Overview

The tool is a local Node.js service with a browser user interface. Analysis and
policy evaluation run in the service; rendering and interaction run in the
browser. The service reads the inspected workspace but stores viewer state in
its own cache directory.

```text
CLI
 └─ Workspace session
     ├─ Nx adapter ─────────────── project facts
     ├─ TypeScript analyzer ────── module and symbol facts
     ├─ Angular enricher ───────── Angular semantic facts
     ├─ Policy engine ──────────── findings
     ├─ Graph store/projector ──── queryable views
     ├─ Watch coordinator ──────── invalidation
     └─ HTTP/WebSocket API
          └─ Browser application ─ diagram, inspector, source navigation
```

## Proposed repository layout

```text
packages/
  model/       Pure graph types, identity, validation, projections
  nx/          Nx workspace discovery and project graph adapter
  typescript/  TypeScript Program creation and module analysis
  angular/     Angular-specific enrichment
  policy/      Boundary rules, cycles, levels, and proposals
  server/      Session orchestration, cache, API, and watching
  cli/         User-facing executable
  web/         Browser interface and graph renderer
fixtures/
  nx-angular-basic/
  nx-angular-integrated/
  nx-angular-large/
docs/
```

Packages are dependency-directed:

```text
model ← nx
model ← typescript ← angular
model ← policy
model ← server ← cli
model ← web
```

`model` cannot import Nx, TypeScript, Angular, the server, or the renderer.
Framework-specific objects must be converted to serializable graph facts at
package boundaries.

## Runtime components

### CLI

Initial commands:

```text
nx-uml-viewer [workspace]
nx-uml-viewer serve [workspace]
nx-uml-viewer analyze [workspace] --output graph.json
nx-uml-viewer doctor [workspace]
```

`serve` is the default. The CLI resolves the workspace root, starts one local
session, prints the URL, and optionally opens the browser. It binds to
loopback by default and requires an explicit option to listen externally.

### Workspace session

A session owns:

- canonical workspace identity;
- detected Nx and Angular capabilities;
- the current immutable graph snapshot;
- analysis diagnostics;
- caches and invalidation state;
- proposal and UI state;
- connected browser clients.

Only the session coordinates analyzers. An analyzer must not start watchers or
write state independently.

### Analyzers

Analyzers return facts plus diagnostics. They do not return renderer shapes.
Facts are merged by stable identifiers. Each edge retains evidence, source,
confidence, and analyzer version.

Analysis has two depths:

1. **Workspace depth:** inexpensive Nx project graph and policy findings.
2. **Project depth:** TypeScript and Angular details for selected projects.

The server may precompute project depth for small workspaces, but the API must
not require this.

### Graph store and projector

The graph store keeps canonical nodes, edges, evidence, findings, and
proposals. A projector produces view models for a requested root, depth,
grouping, filter, and declutter mode.

Layout inputs are deterministic. Coordinates are UI state and do not belong in
the canonical graph.

### API

Use a versioned local API:

```text
GET  /api/v1/session
GET  /api/v1/view?root=...&depth=...&groupBy=...
GET  /api/v1/nodes/:id
GET  /api/v1/edges/:id/evidence
GET  /api/v1/source?location=...
POST /api/v1/proposals
PATCH /api/v1/proposals/:id
GET  /api/v1/events                         (WebSocket or SSE)
```

The exact transport can change, but DTOs must be schema-validated and API
versioned. Source endpoints must reject paths outside the workspace.

### Browser application

The browser owns:

- pan, zoom, selection, and keyboard navigation;
- graph layout and rendering;
- inspector and source preview;
- filtering, grouping, and decluttering;
- proposal editing interactions.

SVG is preferred initially for accessibility and inspectability. The renderer
must be behind an interface so a Canvas/WebGL renderer can be introduced for
very large views without changing graph DTOs.

## Workspace state

Default state location:

```text
<workspace>/.nx-uml-viewer/
```

The CLI warns if this path is not ignored and can use an OS cache directory
instead. State includes caches, session preferences, and proposals. It never
contains executable code loaded without validation.

## Incremental updates

Watch only files that affect known inputs:

- `nx.json`, project configuration, and workspace manifests;
- relevant `tsconfig` files;
- source files in analyzed projects;
- lint configuration used for module-boundary policy.

Changes are debounced and classified:

- workspace configuration change: rebuild Nx facts;
- TypeScript configuration change: rebuild affected programs;
- source change: update affected modules and reverse dependents;
- policy change: reevaluate findings without reparsing source.

Publish a new graph snapshot atomically. Clients must never observe a graph
halfway through recomputation.

## Security and trust boundaries

- Bind to `127.0.0.1` by default.
- Canonicalize and validate every requested file path.
- Do not evaluate workspace JavaScript configuration in the browser.
- Isolate unavoidable Nx configuration loading in the service process.
- Do not run Nx targets, generators, package scripts, or editor commands
  unless the user explicitly invokes that action.
- Escape source and labels before rendering.
- Apply request and payload limits to local API endpoints.

## Performance strategy

- Render project-level views first.
- Analyze module details on demand.
- Cache by workspace fingerprint, tool version, config hashes, and source
  hashes.
- Keep edge evidence separate from summary edges.
- Collapse edges server-side before transfer.
- Move CPU-heavy TypeScript analysis to worker threads only after profiling.
- Set performance budgets in automated tests rather than relying on intuition.

## Failure behavior

Errors are scoped:

- A failed Angular enrichment keeps TypeScript and Nx facts available.
- A malformed project is marked with diagnostics without hiding other projects.
- Unsupported Nx integration falls back to documented project discovery when
  safe; it must not fabricate Nx dependency semantics.
- Stale cache entries are discarded when their schema or analyzer version
  changes.
