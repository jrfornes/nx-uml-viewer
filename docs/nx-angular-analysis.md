# Nx and Angular analysis

## Analysis order

1. Locate and validate the workspace.
2. Read Nx projects and the Nx project graph.
3. Create TypeScript programs for selected projects.
4. Resolve module dependencies and source ownership.
5. Enrich relevant symbols with Angular semantics.
6. Evaluate Nx and viewer policies.
7. Project the canonical graph for display.

Later stages may add facts but must not silently contradict authoritative facts
from earlier stages. Contradictions become diagnostics.

## Nx workspace discovery

Find the nearest ancestor containing `nx.json`, then establish:

- workspace root;
- Nx package and version;
- package manager;
- project configurations;
- project root and source root;
- project type, tags, targets, and metadata;
- Nx project graph dependencies.

Prefer supported public Nx APIs from the installed workspace version. Nx APIs
and graph output evolve, so all Nx access belongs behind an adapter:

```ts
interface NxWorkspaceAdapter {
  capabilities(): NxCapabilities;
  readProjects(): Promise<NxProjectFact[]>;
  readProjectGraph(): Promise<NxProjectGraphFact>;
  readBoundaryPolicy(): Promise<BoundaryPolicyResult>;
}
```

Do not import undocumented `nx/src/...` internals in domain code. During the
bootstrap spike, verify which public APIs cover the supported Nx version
range. If compatibility requires more than one implementation, select by
detected major version and test each adapter against fixtures.

### Project ownership

Map every analyzed source file to the project with the longest matching
canonical project root. Report overlapping equal roots as ambiguous. Generated
files and files outside project roots are excluded or placed in a clearly
marked workspace group.

### Tags and groups

Nx tags commonly encode several independent dimensions:

```text
scope:orders
type:feature
platform:web
layer:domain
```

The UI lets the user select a tag prefix for grouping. It must not assume that
the first tag is architectural. Untagged projects remain visible.

## TypeScript program construction

Use the workspace's installed TypeScript compiler and compiler API. Locate the
most specific project `tsconfig` used for compilation, then follow `extends`,
project references, `baseUrl`, and `paths`.

Important rules:

- Resolve imports with TypeScript's resolver and active compiler options.
- Preserve distinctions between runtime imports, type-only imports, dynamic
  imports, and re-exports.
- Follow barrel files without pretending the barrel owns the final symbol.
- Record both module-level evidence and resolved project ownership.
- Treat unresolved specifiers as diagnostics or external packages; never map
  them by string similarity alone.
- Exclude declarations, generated outputs, and tests according to configurable
  defaults while allowing users to include them.
- Normalize `.ts`, `.tsx`, `.mts`, `.cts`, and Angular-related generated file
  behavior.

The original viewer's TypeScript regex scanner is useful as a behavioral
example only. It is not suitable as the new parser because it cannot reliably
model aliases, re-exports, compiler modes, or symbol identity.

## Module relationships

For each source file:

- static `import` creates `imports` or `type-imports`;
- `export ... from` creates `re-exports`;
- `import(...)` creates `dynamic-imports`;
- resolved package imports create `external-package` nodes;
- project ownership rolls module edges up into project dependencies.

Compare rolled-up dependencies with the Nx graph. A discrepancy is a
diagnostic with possible causes such as stale Nx cache, implicit dependency,
plugin inference, or an excluded source file. Do not automatically label either
side incorrect.

## Angular enrichment

Prefer Angular compiler metadata where stable and available. Use TypeScript AST
and type-checker analysis for constructs that do not require Angular internals.
Place Angular-version-specific behavior behind an adapter similar to Nx.

### Constructs

Recognize:

- `@Component`, `@Directive`, `@Pipe`, `@Injectable`, and `@NgModule`;
- standalone component/directive/pipe `imports`;
- NgModule declarations, imports, and exports;
- constructor-injected tokens;
- `inject(Token)` calls;
- route definitions, `loadChildren`, and `loadComponent`;
- common functional guards and interceptors;
- component template and style file locations as attributes.

### Dependency semantics

- Component or module imports become `angular-imports`.
- Dependency injection becomes `injects`, with source evidence.
- Router lazy loading becomes `routes-to` and usually also corresponds to a
  dynamic TypeScript import.
- A decorator declaring a symbol is metadata, not a dependency by itself.
- String tokens and complex provider factories may be heuristic; mark their
  confidence accordingly.

### Templates

The first release records template ownership but does not construct edges from
selectors found in HTML. Selector matching is ambiguous without Angular's full
compilation scope. If later implemented, it must use Angular compiler scopes
rather than global selector search.

## Boundary policy

Nx module-boundary configuration is the primary policy source when available.
The adapter should normalize supported constraints into:

```ts
interface BoundaryConstraint {
  id: string;
  sourceTag?: string;
  allowedTargetTags?: string[];
  forbiddenTargetTags?: string[];
  dependencyKinds?: string[];
  sourceLocation?: SourceLocation;
}
```

Nx lint configuration can be JavaScript and can vary by ESLint/Nx generation.
Reading it safely is a compatibility problem, not ordinary JSON parsing.
Implementation must:

1. identify supported configuration forms;
2. report unsupported dynamic forms;
3. retain the originating rule and location;
4. avoid claiming exact parity until tested against Nx behavior.

An optional viewer policy may define conceptual ranks or additional rules.
Viewer findings are labeled separately from Nx findings.

## Diagnostics

Every analyzer returns structured diagnostics:

```ts
interface Diagnostic {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  location?: SourceLocation;
  analyzer: string;
  recoverable: boolean;
}
```

Examples include unsupported Nx major versions, unresolved aliases, ambiguous
project ownership, malformed routes, Angular metadata unavailable, and dynamic
ESLint configuration that cannot be normalized.

## Compatibility matrix

The bootstrap phase must establish and continuously test a declared matrix for:

- supported Node.js versions;
- supported Nx major versions;
- supported TypeScript versions;
- supported Angular major versions;
- integrated and package-based Nx workspace layouts;
- npm, pnpm, and Yarn workspace resolution.

Do not advertise “Nx compatible” without publishing this matrix.
