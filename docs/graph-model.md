# Graph model

## Goals

The model must represent observed workspace structure independently of Nx,
TypeScript, Angular, layout, or transport libraries. It must support stable
identity, progressive detail, explainable aggregate edges, findings, and
hypothetical proposals.

## Canonical graph

```ts
interface ArchitectureGraph {
  schemaVersion: number;
  workspace: WorkspaceDescriptor;
  nodes: Record<NodeId, GraphNode>;
  edges: Record<EdgeId, GraphEdge>;
  findings: Record<FindingId, Finding>;
  diagnostics: Diagnostic[];
  revision: string;
}
```

Use runtime schemas at all persistence and API boundaries. TypeScript types
alone do not validate cache files or requests.

## Identity

IDs are deterministic URI-like strings:

```text
workspace://.
nx-project://catalog
ts-module://libs/catalog/src/lib/catalog.service.ts
ts-symbol://libs/catalog/src/lib/catalog.service.ts#CatalogService
angular-route://apps/shop/src/app/app.routes.ts#products
external-package://@angular/core
group://scope/catalog
```

Rules:

- Paths are canonical, workspace-relative, and use `/`.
- IDs do not include display labels, hashes, locations, or array positions.
- Symbol identity uses the declaration's exported or declared name plus module
  identity. Overloads share one logical symbol unless separate display is
  required.
- Anonymous constructs receive a deterministic source-derived discriminator
  and are not persisted in proposals until proven stable.
- A renamed or moved source entity is a new identity. Rename inference belongs
  to a later migration layer, not base identity.

## Node kinds

Initial kinds:

- `workspace`
- `group`
- `nx-project`
- `directory`
- `ts-module`
- `ts-symbol`
- `angular-component`
- `angular-directive`
- `angular-pipe`
- `angular-service`
- `angular-guard`
- `angular-interceptor`
- `angular-module`
- `angular-route`
- `external-package`

Every node has:

```ts
interface GraphNode {
  id: NodeId;
  kind: NodeKind;
  label: string;
  parentId?: NodeId;
  projectId?: NodeId;
  location?: SourceLocation;
  tags: string[];
  attributes: Record<string, JsonValue>;
  provenance: Provenance[];
}
```

Containment is expressed by `parentId`, not a normal dependency edge. The
canonical parent follows physical ownership: workspace, project, directory,
module, symbol. Visual tag groups are projections and do not rewrite physical
containment.

## Edge kinds

Initial kinds:

- `nx-dependency`
- `imports`
- `dynamic-imports`
- `re-exports`
- `type-imports`
- `injects`
- `declares`
- `angular-imports`
- `routes-to`
- `inherits`
- `implements`
- `calls`

Not every possible TypeScript call belongs in the first release. `calls` is
reserved for relationships the analyzer can establish with useful confidence.

```ts
interface GraphEdge {
  id: EdgeId;
  kind: EdgeKind;
  from: NodeId;
  to: NodeId;
  evidence: Evidence[];
  attributes: Record<string, JsonValue>;
  provenance: Provenance[];
}
```

Edge identity is derived from kind, endpoints, and a semantic discriminator.
Multiple import statements between the same modules normally become one edge
with multiple evidence entries.

## Evidence and provenance

Every inferred relationship must answer “why is this here?”

```ts
interface Evidence {
  location?: SourceLocation;
  description: string;
  specifier?: string;
  symbol?: string;
}

interface Provenance {
  analyzer: 'nx' | 'typescript' | 'angular' | 'policy' | 'user';
  analyzerVersion: string;
  confidence: 'authoritative' | 'resolved' | 'heuristic';
}
```

Heuristic edges are visually and textually distinguishable. They cannot be
used for hard policy failures by default.

## Findings

A violation, cycle, or warning is not encoded by changing the edge kind.

```ts
interface Finding {
  id: FindingId;
  ruleId: string;
  severity: 'info' | 'warning' | 'error';
  subjectIds: string[];
  message: string;
  evidence: Evidence[];
  source: 'nx-policy' | 'viewer-policy' | 'analysis';
}
```

This permits several policies to classify the same fact differently and keeps
the observed graph separate from architectural opinion.

## Aggregate views

A view maps canonical nodes to visible nodes. An aggregate edge records all
canonical edges it represents:

```ts
interface ViewEdge {
  id: string;
  from: string;
  to: string;
  kinds: EdgeKind[];
  memberEdgeIds: EdgeId[];
  findingIds: FindingId[];
}
```

An aggregate is violating when it contains at least one visible finding.
Inspecting it returns member edges and their evidence. Decluttering may hide
lines, but it must not discard dependency information.

## Cycles

Cycles are strongly connected components calculated separately for each useful
projection:

- Nx projects;
- TypeScript modules within a project;
- optionally symbols.

A cycle finding records the component and at least one concrete path. A
two-way aggregate edge is not sufficient evidence of the complete cycle.

## Proposals

A proposal overlays conceptual organization and policy on the canonical graph:

```ts
interface Proposal {
  id: string;
  name: string;
  baseRevision: string;
  groups: ProposalGroup[];
  placements: Record<NodeId, string>;
  omittedNodeIds: NodeId[];
  policy?: ViewerPolicy;
}
```

Proposals cannot mutate canonical nodes or observed edges. If the underlying
revision changes, the tool reports missing and newly unassigned identities.

## Versioning

- Increment `schemaVersion` for incompatible persisted graph changes.
- Version API DTOs independently from cache serialization.
- Include analyzer versions in cache keys.
- Migrations may preserve proposals and UI settings, but analysis caches can
  always be discarded.
