# react-native-bundle-discovery-ui

## 2.8.0

### Minor Changes

- [`64fd3fd`](https://github.com/retyui/react-native-bundle-discovery/commit/64fd3fdb878fa539ed3c9f032588c61d301f61d1) Thanks [@retyui](https://github.com/retyui)! - Support [esbuild metafile](https://esbuild.github.io/api/#metafile) as input (e.g. from `@rnx-kit/metro-serializer-esbuild` with the `metafile` option), with module sizes after tree shaking.

## 2.7.0

### Minor Changes

- [#16](https://github.com/retyui/react-native-bundle-discovery/pull/16) [`ac2af30`](https://github.com/retyui/react-native-bundle-discovery/commit/ac2af3063e3c4031ee026b58d4039e56f7152383) Thanks [@retyui](https://github.com/retyui)! - Rewrite in TypeScript and ship compiled JavaScript from `dist/` (with type definitions for `react-native-bundle-discovery` and the Rozenite plugin). Package entry points are unchanged; deep imports of internal files (e.g. `react-native-bundle-discovery/webpack.js`, `react-native-bundle-discovery-ui/.discoveryrc.js`) moved under `dist/`.
