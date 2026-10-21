# Engineering decisions

This document records decisions that constrain implementation. Revisit a
decision by adding a dated replacement rather than silently changing its
meaning.

## D001: Build a new TypeScript implementation

**Status:** accepted

The original Clojure/Quil viewer is a behavioral reference, not a runtime
dependency. Nx, TypeScript, and Angular analysis require their native compiler
and workspace ecosystems, and a browser UI is easier to distribute across
developer platforms.

## D002: Run locally and remain read-only by default

**Status:** accepted

The default command starts a loopback service and browser UI. It may read
workspace configuration and source but does not run generators, targets,
builds, tests, or refactors. Explicit future actions may cross this boundary
only with clear user intent.

## D003: Separate observed facts from policy findings

**Status:** accepted

An import remains an import regardless of whether Nx or a proposal allows it.
Violations and warnings are separate findings referencing facts. This supports
multiple policies and avoids corrupting graph semantics for rendering.

## D004: Use Nx for projects and TypeScript for modules

**Status:** accepted

Nx is authoritative for project identity, roots, tags, targets, and its project
graph. The TypeScript compiler API is authoritative for source module
resolution and symbols. Differences between them are diagnosed, not resolved
through undocumented assumptions.

## D005: Put framework integrations behind adapters

**Status:** accepted

Nx and Angular public APIs vary by major version. Their objects cannot leak
into the canonical graph model. Version-specific adapters normalize facts and
advertise capabilities. Supported versions are decided by executable
compatibility tests.

## D006: Analyze progressively

**Status:** accepted

Project-level Nx facts are loaded first. Module and Angular details are loaded
for selected projects and cached. This is necessary for large workspaces and
keeps the first useful view fast.

## D007: Use deterministic, path-based identities

**Status:** accepted

Canonical workspace-relative paths and declared names form stable IDs. Display
labels, database counters, and layout coordinates are excluded. Moving or
renaming an entity creates a new identity; proposal reconciliation reports it.

## D008: Keep aggregate edge evidence

**Status:** accepted

Collapsed edges contain references to all represented canonical edges and
findings. Decluttering can alter display but cannot erase explainability.

## D009: Prefer SVG for the first renderer

**Status:** provisional

SVG supports accessibility, event handling, text, and straightforward
debugging. The renderer consumes a framework-independent view DTO so measured
performance can justify Canvas or WebGL later without changing analyzers.

## D010: Do not infer template selector dependencies initially

**Status:** accepted

Global selector matching creates false relationships because Angular template
scope depends on standalone and NgModule compilation context. The first release
records template ownership but does not create selector-use edges.

## D011: Store proposals as overlays

**Status:** accepted

A proposal groups existing stable IDs and applies hypothetical policy. It does
not duplicate or mutate canonical graph facts and is always marked as not
instantiated in code.

## D012: Treat boundary-rule parity as tested compatibility

**Status:** accepted

Nx module-boundary configuration appears in several ESLint formats and may
contain executable configuration. The tool only claims support for forms
covered by parity fixtures. Unsupported dynamic policy produces a diagnostic
instead of a guessed result.

## Open decisions for the bootstrap spike

The following should not be fixed by documentation alone:

1. Package workspace manager and build orchestrator for this repository.
2. Exact supported Nx, Angular, TypeScript, and Node.js version matrix.
3. Public Nx API or command-output strategy for each supported Nx major.
4. Angular compiler API surface that is stable enough for enrichment.
5. Browser framework and graph layout library.
6. WebSocket versus server-sent events for live updates.
7. Default OS cache location versus workspace-local ignored state.
8. Editor integration protocol and cross-platform behavior.

Resolve each through a small executable spike, fixture evidence, and an added
decision entry.
