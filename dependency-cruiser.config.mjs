/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed between packages.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'model-is-framework-free',
      severity: 'error',
      comment: 'The model package must stay framework-independent.',
      from: { path: '^packages/model' },
      to: {
        path: '^packages/(nx|typescript|angular|policy|server|cli|web)',
      },
    },
    {
      name: 'model-no-node-imports',
      severity: 'error',
      from: { path: '^packages/model' },
      to: { path: '^(node:|fs|path|child_process)' },
    },
    {
      name: 'nx-depends-only-on-model',
      severity: 'error',
      from: { path: '^packages/nx' },
      to: {
        path: '^packages/(typescript|angular|policy|server|cli|web)',
      },
    },
    {
      name: 'typescript-depends-only-on-model',
      severity: 'error',
      from: { path: '^packages/typescript' },
      to: {
        path: '^packages/(nx|angular|policy|server|cli|web)',
      },
    },
    {
      name: 'angular-boundary',
      severity: 'error',
      from: { path: '^packages/angular' },
      to: { path: '^packages/(nx|policy|server|cli|web)' },
    },
    {
      name: 'policy-depends-only-on-model',
      severity: 'error',
      from: { path: '^packages/policy' },
      to: {
        path: '^packages/(nx|typescript|angular|server|cli|web)',
      },
    },
    {
      name: 'server-depends-only-on-model',
      severity: 'error',
      from: { path: '^packages/server' },
      to: {
        path: '^packages/(nx|typescript|angular|policy|cli|web)',
      },
    },
    {
      name: 'web-depends-only-on-model',
      severity: 'error',
      from: { path: '^packages/web' },
      to: {
        path: '^packages/(nx|typescript|angular|policy|server|cli)',
      },
    },
    {
      name: 'cli-boundary',
      severity: 'error',
      from: { path: '^packages/cli' },
      to: { path: '^packages/(policy|server|web)' },
    },
    {
      name: 'no-nx-internal-imports',
      severity: 'error',
      comment: 'Undocumented nx/src imports are forbidden.',
      from: { path: '^packages' },
      to: { path: 'node_modules/nx/src' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.build.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
