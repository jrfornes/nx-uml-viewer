# Product and scope

## Purpose

Nx UML Viewer helps developers understand and improve the architecture of an
Nx workspace. It combines Nx project metadata with TypeScript and Angular
relationships and presents the result as an interactive diagram that can be
drilled down to source code.

The tool is an architecture explorer, not a replacement for Nx Console, an
IDE, or a general-purpose UML editor.

## Primary users

- A developer joining an unfamiliar Nx Angular workspace.
- An architect checking project boundaries, dependency direction, and cycles.
- A team restructuring applications and libraries into clearer domains.
- An automated assistant discussing proposed architecture changes with a user.

## Core user journeys

### Explore the real workspace

1. Run the tool from an Nx workspace.
2. See applications and libraries grouped by their existing Nx tags.
3. Inspect dependencies, boundary violations, and cycles.
4. Drill from a project into directories, TypeScript modules, Angular
   declarations, and source.
5. Filter or declutter the graph without changing the source tree.

### Evaluate a proposal

1. Copy the current architecture into a named proposal.
2. Move projects or modules between conceptual groups.
3. Recalculate dependency direction and boundary violations.
4. Compare the proposal with the real workspace.
5. Export the proposal as data suitable for a human or coding agent.

Proposals are views. They must never imply that the source has already changed.

### Diagnose a boundary problem

1. Select a red dependency or an Nx constraint violation.
2. See the concrete imports represented by the collapsed edge.
3. Open the importing and imported source.
4. Understand which Nx rule was violated and why.

## First release

The first usable release must:

- discover an Nx workspace without editing it;
- support TypeScript applications and libraries, with Angular enrichment;
- render the Nx project graph and group projects by tags;
- drill into project TypeScript modules;
- resolve relative imports and configured TypeScript path aliases;
- expose direct, transitive, circular, and collapsed dependencies;
- evaluate Nx module-boundary constraints when they can be read safely;
- recognize common Angular constructs and lazy routes;
- open source locations through a configurable editor URL or command;
- update after relevant files change;
- persist UI state outside tracked source files;
- provide actionable diagnostics for malformed or unsupported workspaces.

## Explicitly deferred

- Automatic source refactoring.
- Mutation and CRAP metrics.
- Parsing non-TypeScript languages.
- A hosted multi-user service.
- Full TypeScript type diagrams for every interface and class.
- Template-level binding and DOM visualization.
- Exact emulation of the original Quil layout and rendering.

Deferred capabilities must not shape the first release into an unusable
framework. The graph model should permit metrics and proposals to be added
without redesigning identity or dependency semantics.

## Product principles

1. **Workspace metadata is authoritative at project level.** Nx owns project
   identity, roots, tags, targets, and declared dependencies.
2. **The TypeScript program is authoritative below project level.** Imports,
   exports, aliases, and source locations must not be inferred with regexes.
3. **Angular adds meaning rather than replacing TypeScript facts.**
4. **Every aggregate edge is explainable.** Users can inspect its concrete
   evidence.
5. **The real architecture and proposals are visibly distinct.**
6. **Read-only by default.** Running the viewer must not generate projects,
   rewrite configuration, or invoke builds.
7. **Large workspaces are normal.** Progressive disclosure and incremental
   analysis are requirements, not later optimizations.

## Success criteria

- A developer can locate the owner and source of a dependency in three
  interactions or fewer.
- Project-level diagrams remain responsive with at least 500 Nx projects.
- Module-level analysis can be restricted to the opened project.
- Each reported violation names its source rule and concrete evidence.
- The same unchanged workspace produces stable node and edge identifiers.
- Unsupported syntax produces a diagnostic rather than silently inventing an
  edge.

## Terminology

- **Workspace:** the inspected Nx repository.
- **Project:** an Nx application or library.
- **Module:** a TypeScript source module, normally one source file.
- **Symbol:** a relevant exported TypeScript or Angular declaration.
- **Group:** a visual or proposed collection, commonly derived from Nx tags.
- **Fact:** an observed relationship with source evidence.
- **Policy:** a rule used to classify facts as allowed or violating.
- **View:** a projection of the graph at a selected depth and filter.
