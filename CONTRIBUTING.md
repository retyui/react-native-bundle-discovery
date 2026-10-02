# Contributing

## Repository layout

Yarn 4 workspaces monorepo. Every package is written in TypeScript and built to JavaScript with [tsdown](https://tsdown.dev).

| Folder                      | npm package                                     | Notes                                                                                |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/serializer`       | `react-native-bundle-discovery`                 | Metro serializer + Webpack/Rspack plugin                                             |
| `packages/ui`               | `react-native-bundle-discovery-ui`              | Browser UI (discovery.js). `src/client` is browser code, bundled by discovery.js     |
| `packages/cli`              | `react-native-bundle-discovery-cli`             | Terminal / CI reports                                                                |
| `packages/rozenite-plugin`  | `react-native-bundle-discovery-rozenite-plugin` | React Native DevTools panel                                                          |
| `packages/shared`           | — (private)                                     | Code shared by `ui` and `cli` (rsdoctor transform, report types). Inlined at build time |

## Commands

```bash
yarn install
yarn build       # build all packages (dist/)
yarn typecheck   # tsc --noEmit for every package (run after build)
yarn lint        # Biome: lint + format check
yarn lint:fix    # Biome: apply safe fixes + format
yarn dev:ui      # run the UI against ./tmp/metro-stats.json
```

Run a built CLI locally:

```bash
node packages/ui/dist/bin.js path/to/metro-stats.json
node packages/cli/dist/bin.js analyze path/to/metro-stats.json
```

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets):

1. Add a changeset to your PR: `yarn changeset`.
2. After merge to `main`, the Release workflow opens/updates a **"chore: version packages"** PR.
3. Merging that PR publishes all packages to npm (with provenance) and creates GitHub releases.

The workflow needs an `NPM_TOKEN` repository secret (npm automation token with publish rights).
