# react-native-bundle-discovery-ui

## 2.9.1

### Patch Changes

- [`bcd0922`](https://github.com/retyui/react-native-bundle-discovery/commit/bcd09227bd83179005e484146c527cb01ad0d589) Thanks [@retyui](https://github.com/retyui)! - Readable "Dev bundle" and "Not minified" warnings in the top bar in dark mode.

- [`e3ff2b1`](https://github.com/retyui/react-native-bundle-discovery/commit/e3ff2b1546289f054a8103958698ca8b47016763) Thanks [@retyui](https://github.com/retyui)! - Package ids like `memoize-one@5.2.1` in the "Update outdated packages", "Replace deprecated packages" and "Remove dev-only packages from production bundle" recommendations are shown as code instead of being turned into `mailto:` links in the UI.

## 2.9.0

### Minor Changes

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`9a7d932`](https://github.com/retyui/react-native-bundle-discovery/commit/9a7d9325d6039354ba661d68b47eef85dc8334ff) Thanks [@retyui](https://github.com/retyui)! - New `--compare <before.json>` option for the `server` and `build` commands: adds a "Compare" tab to the default page with the difference between the two reports (bundle size, modules and packages count, new duplicates and deprecated packages, package version changes, added/removed/changed modules). Uses the same comparison as `react-native-bundle-discovery-cli compare`.

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`1819d53`](https://github.com/retyui/react-native-bundle-discovery/commit/1819d53c4c0b560f186c90d8cf9cfabf52d2be5e) Thanks [@retyui](https://github.com/retyui)! - Module page: the "Imported by" graph is drawn with D3 (a tree from the current module to its importers, sized by module size, with zoom/pan, hover highlighting and click to open a module). Highcharts and the vendored `vendors/` files were removed.

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`6271156`](https://github.com/retyui/react-native-bundle-discovery/commit/627115602e54b474670fcaf42b1599570fc76940) Thanks [@retyui](https://github.com/retyui)! - New default "Insights" tab: bundle summary cards, heaviest packages and own modules, and the optimization recommendations of the `analyze` CLI command ranked by estimated savings (production reports only). Header badges show the share of the bundle, the treemap can be colored by package, file type or issues (duplicates / removable code), the "Duplicates" tab lists duplicate packages with possible savings, and the package page shows the shortest import chain ("Why is this in my bundle?").

- [`237407e`](https://github.com/retyui/react-native-bundle-discovery/commit/237407e43ffaf3a298f86fce71ff0e3850e5015f) Thanks [@retyui](https://github.com/retyui)! - Module page: new header with package/version and status chips, stat cards (size share and rank, transform delta, lines, package share, imports, importers, duplicates) and a new Imports tab.

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`2cfe22d`](https://github.com/retyui/react-native-bundle-discovery/commit/2cfe22dda8ded6fd37076aadde194a4142c46c7a) Thanks [@retyui](https://github.com/retyui)! - Package page: new header with versions, status and recommendation chips and quick links, stat cards (bundle share and rank, files, copies with possible savings, importers, publish date) and tabs for files, importers, the import chain and versions. Fixes a package page showing files of another package whose name contains the requested one (e.g. `react` and `react-native`).

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`a910869`](https://github.com/retyui/react-native-bundle-discovery/commit/a910869464542f8bdfe62776ca8f608610a3a735) Thanks [@retyui](https://github.com/retyui)! - Default page: the row of badges on top is replaced with a compact report bar: platform, a warning for dev or unminified bundles (green "Production · Minified" otherwise), the total size with a "your code / node_modules" split bar, and the report build date.

- [#20](https://github.com/retyui/react-native-bundle-discovery/pull/20) [`5817574`](https://github.com/retyui/react-native-bundle-discovery/commit/58175749496a860dbfa87da7fbdd7a9e8dd67844) Thanks [@retyui](https://github.com/retyui)! - Packages and Modules tabs: show the total size of filtered items and allow sorting by size, name or duplicates.

### Patch Changes

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`d40a350`](https://github.com/retyui/react-native-bundle-discovery/commit/d40a350eb97f2077a84c28421d2d063288167577) Thanks [@retyui](https://github.com/retyui)! - Treemap: more vivid colors with cushion shading, and sub-folders of a package get a slightly shifted hue so big packages show their structure.

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`2cfe22d`](https://github.com/retyui/react-native-bundle-discovery/commit/2cfe22dda8ded6fd37076aadde194a4142c46c7a) Thanks [@retyui](https://github.com/retyui)! - Packages tab: remove the "Copy list" and "Ask ChatGPT" buttons. Packages and Modules tabs: "Sort by" is now on the left of the filter.

- [`9331e2f`](https://github.com/retyui/react-native-bundle-discovery/commit/9331e2f875f4b6cdeeda4ccda2ac5bb2c03700cd) Thanks [@retyui](https://github.com/retyui)! - Packages and Modules tabs: keep the entered filter value after opening a package/module page and navigating back.

## 2.8.0

### Minor Changes

- [`64fd3fd`](https://github.com/retyui/react-native-bundle-discovery/commit/64fd3fdb878fa539ed3c9f032588c61d301f61d1) Thanks [@retyui](https://github.com/retyui)! - Support [esbuild metafile](https://esbuild.github.io/api/#metafile) as input (e.g. from `@rnx-kit/metro-serializer-esbuild` with the `metafile` option), with module sizes after tree shaking.

## 2.7.0

### Minor Changes

- [#16](https://github.com/retyui/react-native-bundle-discovery/pull/16) [`ac2af30`](https://github.com/retyui/react-native-bundle-discovery/commit/ac2af3063e3c4031ee026b58d4039e56f7152383) Thanks [@retyui](https://github.com/retyui)! - Rewrite in TypeScript and ship compiled JavaScript from `dist/` (with type definitions for `react-native-bundle-discovery` and the Rozenite plugin). Package entry points are unchanged; deep imports of internal files (e.g. `react-native-bundle-discovery/webpack.js`, `react-native-bundle-discovery-ui/.discoveryrc.js`) moved under `dist/`.
