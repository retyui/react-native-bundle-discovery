# react-native-bundle-discovery-cli

## 2.12.0

### Minor Changes

- [`bd2a5e0`](https://github.com/retyui/react-native-bundle-discovery/commit/bd2a5e08f41a2051fef7c9a1a1dedeaf89a057bc) Thanks [@retyui](https://github.com/retyui)! - Add a recommendation to remove extra `XMLHttpRequest` implementations from the bundle and use the one built into React Native (`react-native/Libraries/Network/XMLHttpRequest.js`).

- [`fe3306e`](https://github.com/retyui/react-native-bundle-discovery/commit/fe3306e8f3306702a023748559838e25492f57d6) Thanks [@retyui](https://github.com/retyui)! - Add a recommendation that lists packages shipping inlined TypeScript (`__awaiter`, `__extends`, ...) or Babel (`_classCallCheck`, `_asyncToGenerator`, ...) helpers in their source code, with the files that contain them.

## 2.11.0

### Minor Changes

- [`07bb945`](https://github.com/retyui/react-native-bundle-discovery/commit/07bb94580e59966c72f427a1da2a5212a0cdc1cc) Thanks [@retyui](https://github.com/retyui)! - Add a recommendation to put i18n libraries (`fbtee`, `i18next`, `react-intl`, `@lingui/core`, …) into Metro's `nonInlinedRequires`, as they are expected to be required in many places of the code.

### Patch Changes

- [`f50c377`](https://github.com/retyui/react-native-bundle-discovery/commit/f50c37761e5880f4499a6f2213d95460637768fb) Thanks [@retyui](https://github.com/retyui)! - Mention `@react-native/metro-config` alongside `@react-native/babel-preset` in the "platform-specific dead code" recommendation.

## 2.10.0

### Patch Changes

- [`88cae65`](https://github.com/retyui/react-native-bundle-discovery/commit/88cae65917c4ac28e62be67d32d5ea943c237419) Thanks [@retyui](https://github.com/retyui)! - Flag mock and fixture files (`__mocks__/`, `__fixtures__/`, `mock(s).ts`, `*.mock(s).ts`) in the "dev files in production bundle" recommendation.

## 2.9.1

### Patch Changes

- [`e3ff2b1`](https://github.com/retyui/react-native-bundle-discovery/commit/e3ff2b1546289f054a8103958698ca8b47016763) Thanks [@retyui](https://github.com/retyui)! - Package ids like `memoize-one@5.2.1` in the "Update outdated packages", "Replace deprecated packages" and "Remove dev-only packages from production bundle" recommendations are shown as code instead of being turned into `mailto:` links in the UI.

## 2.9.0

### Minor Changes

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`6271156`](https://github.com/retyui/react-native-bundle-discovery/commit/627115602e54b474670fcaf42b1599570fc76940) Thanks [@retyui](https://github.com/retyui)! - `analyze`: recommendations now include an estimated `sizeInBytes` saving and the affected `modules` (JSON output), and print a "Savings" line. Duplicate package entries with the same path are no longer counted as savings.

## 2.8.0

### Minor Changes

- [`64fd3fd`](https://github.com/retyui/react-native-bundle-discovery/commit/64fd3fdb878fa539ed3c9f032588c61d301f61d1) Thanks [@retyui](https://github.com/retyui)! - Support [esbuild metafile](https://esbuild.github.io/api/#metafile) as input (e.g. from `@rnx-kit/metro-serializer-esbuild` with the `metafile` option), with module sizes after tree shaking.

## 2.7.0

### Minor Changes

- [#16](https://github.com/retyui/react-native-bundle-discovery/pull/16) [`ac2af30`](https://github.com/retyui/react-native-bundle-discovery/commit/ac2af3063e3c4031ee026b58d4039e56f7152383) Thanks [@retyui](https://github.com/retyui)! - Rewrite in TypeScript and ship compiled JavaScript from `dist/` (with type definitions for `react-native-bundle-discovery` and the Rozenite plugin). Package entry points are unchanged; deep imports of internal files (e.g. `react-native-bundle-discovery/webpack.js`, `react-native-bundle-discovery-ui/.discoveryrc.js`) moved under `dist/`.
