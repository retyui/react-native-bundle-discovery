# react-native-bundle-discovery

## 2.9.0

### Minor Changes

- [`86b7729`](https://github.com/retyui/react-native-bundle-discovery/commit/86b77297be8530b55c490f4f7130c7f0fc3fce9d) Thanks [@retyui](https://github.com/retyui)! - New `removePromisePolyfill` option for `createResolveRequest`: removes the unused `react-native/Libraries/Promise.js` module from release bundles (Hermes provides `Promise` out of the box). The "Remove Promise polyfills" recommendation already suggested this option, but `createResolveRequest` ignored it before.

## 2.8.0

### Patch Changes

- [`3b2640f`](https://github.com/retyui/react-native-bundle-discovery/commit/3b2640ff010dd28e9f1dc3c1351d0b856b31cd1f) Thanks [@retyui](https://github.com/retyui)! - Limit process keep-alive while writing the report to 30s

## 2.7.0

### Minor Changes

- [#16](https://github.com/retyui/react-native-bundle-discovery/pull/16) [`ac2af30`](https://github.com/retyui/react-native-bundle-discovery/commit/ac2af3063e3c4031ee026b58d4039e56f7152383) Thanks [@retyui](https://github.com/retyui)! - Rewrite in TypeScript and ship compiled JavaScript from `dist/` (with type definitions for `react-native-bundle-discovery` and the Rozenite plugin). Package entry points are unchanged; deep imports of internal files (e.g. `react-native-bundle-discovery/webpack.js`, `react-native-bundle-discovery-ui/.discoveryrc.js`) moved under `dist/`.
