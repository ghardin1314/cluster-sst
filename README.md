# cluster-sst

A pnpm monorepo for cluster-sst project.

## Structure

This monorepo is organized using the following structure:

```
├── apps/          # Applications (frontend, backend, etc.)
├── packages/      # Shared packages and libraries
├── libs/          # Internal libraries
├── tools/         # Development tools and utilities
├── package.json   # Root package.json with workspace scripts
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## Prerequisites

- Node.js >= 18
- pnpm >= 8

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build all packages:

   ```bash
   pnpm build
   ```

3. Run development mode for all packages:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm build` - Build all packages
- `pnpm dev` - Run development mode for all packages
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean build outputs for all packages

## Working with Packages

### Adding a new package

1. Create a new directory under the appropriate folder (`apps/`, `packages/`, `libs/`, or `tools/`)
2. Initialize the package with `pnpm init` in the new directory
3. Add dependencies specific to that package

### Adding dependencies

- **Add a dependency to a specific package:**

  ```bash
  pnpm add <package> --filter <workspace-name>
  ```

- **Add a dev dependency to a specific package:**

  ```bash
  pnpm add -D <package> --filter <workspace-name>
  ```

- **Add a dependency to the root:**
  ```bash
  pnpm add -w <package>
  ```

### Running scripts in specific packages

```bash
pnpm --filter <workspace-name> <script>
```

Example:

```bash
pnpm --filter my-app dev
```

## Workspace Management

This monorepo uses pnpm workspaces. The workspace configuration is defined in `pnpm-workspace.yaml`.

For more information about pnpm workspaces, visit: https://pnpm.io/workspaces
