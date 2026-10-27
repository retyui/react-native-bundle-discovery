# react-native-bundle-discovery-rozenite-plugin

## 2.12.0

### Patch Changes

- [#29](https://github.com/retyui/react-native-bundle-discovery/pull/29) [`c3679d5`](https://github.com/retyui/react-native-bundle-discovery/commit/c3679d50bb173435d8fc5ee5748ade2b8aa7faa3) Thanks [@Mohamed-kassim](https://github.com/Mohamed-kassim)! - Don't crash Metro when port 8071 is already in use. With two Metro servers running at once (for example one per git worktree), the second one used to exit on start with `EADDRINUSE`. It now prints a warning and keeps running without its own panel server.
- Updated dependencies [[`bd2a5e0`](https://github.com/retyui/react-native-bundle-discovery/commit/bd2a5e08f41a2051fef7c9a1a1dedeaf89a057bc), [`fe3306e`](https://github.com/retyui/react-native-bundle-discovery/commit/fe3306e8f3306702a023748559838e25492f57d6), [`2f2b1ac`](https://github.com/retyui/react-native-bundle-discovery/commit/2f2b1ac79111e2a7f4d68ee29249f1c236dff677)]:
  - react-native-bundle-discovery-ui@2.12.0
  - react-native-bundle-discovery@2.12.0

## 2.11.0

### Patch Changes

- Updated dependencies [[`07bb945`](https://github.com/retyui/react-native-bundle-discovery/commit/07bb94580e59966c72f427a1da2a5212a0cdc1cc), [`f50c377`](https://github.com/retyui/react-native-bundle-discovery/commit/f50c37761e5880f4499a6f2213d95460637768fb)]:
  - react-native-bundle-discovery-ui@2.11.0
  - react-native-bundle-discovery@2.11.0

## 2.10.0

### Patch Changes

- Updated dependencies [[`88cae65`](https://github.com/retyui/react-native-bundle-discovery/commit/88cae65917c4ac28e62be67d32d5ea943c237419), [`88cae65`](https://github.com/retyui/react-native-bundle-discovery/commit/88cae65917c4ac28e62be67d32d5ea943c237419), [`88cae65`](https://github.com/retyui/react-native-bundle-discovery/commit/88cae65917c4ac28e62be67d32d5ea943c237419), [`44d56f0`](https://github.com/retyui/react-native-bundle-discovery/commit/44d56f0dfb94c99c8f4eb689302a22674508496a), [`ffe4504`](https://github.com/retyui/react-native-bundle-discovery/commit/ffe45041613d3d93ac0d13345c0a1e26d2ad1e80)]:
  - react-native-bundle-discovery-ui@2.10.0
  - react-native-bundle-discovery@2.10.0

## 2.9.1

### Patch Changes

- Updated dependencies [[`bcd0922`](https://github.com/retyui/react-native-bundle-discovery/commit/bcd09227bd83179005e484146c527cb01ad0d589), [`e3ff2b1`](https://github.com/retyui/react-native-bundle-discovery/commit/e3ff2b1546289f054a8103958698ca8b47016763)]:
  - react-native-bundle-discovery-ui@2.9.1
  - react-native-bundle-discovery@2.9.1

## 2.9.0

### Patch Changes

- [#23](https://github.com/retyui/react-native-bundle-discovery/pull/23) [`6271156`](https://github.com/retyui/react-native-bundle-discovery/commit/627115602e54b474670fcaf42b1599570fc76940) Thanks [@retyui](https://github.com/retyui)! - New default "Insights" tab: bundle summary cards, heaviest packages and own modules, and the optimization recommendations of the `analyze` CLI command ranked by estimated savings (production reports only). Header badges show the share of the bundle, the treemap can be colored by package, file type or issues (duplicates / removable code), the "Duplicates" tab lists duplicate packages with possible savings, and the package page shows the shortest import chain ("Why is this in my bundle?").
- Updated dependencies [[`9a7d932`](https://github.com/retyui/react-native-bundle-discovery/commit/9a7d9325d6039354ba661d68b47eef85dc8334ff), [`1819d53`](https://github.com/retyui/react-native-bundle-discovery/commit/1819d53c4c0b560f186c90d8cf9cfabf52d2be5e), [`6271156`](https://github.com/retyui/react-native-bundle-discovery/commit/627115602e54b474670fcaf42b1599570fc76940), [`d40a350`](https://github.com/retyui/react-native-bundle-discovery/commit/d40a350eb97f2077a84c28421d2d063288167577), [`237407e`](https://github.com/retyui/react-native-bundle-discovery/commit/237407e43ffaf3a298f86fce71ff0e3850e5015f), [`2cfe22d`](https://github.com/retyui/react-native-bundle-discovery/commit/2cfe22dda8ded6fd37076aadde194a4142c46c7a), [`2cfe22d`](https://github.com/retyui/react-native-bundle-discovery/commit/2cfe22dda8ded6fd37076aadde194a4142c46c7a), [`9331e2f`](https://github.com/retyui/react-native-bundle-discovery/commit/9331e2f875f4b6cdeeda4ccda2ac5bb2c03700cd), [`a910869`](https://github.com/retyui/react-native-bundle-discovery/commit/a910869464542f8bdfe62776ca8f608610a3a735), [`86b7729`](https://github.com/retyui/react-native-bundle-discovery/commit/86b77297be8530b55c490f4f7130c7f0fc3fce9d), [`5817574`](https://github.com/retyui/react-native-bundle-discovery/commit/58175749496a860dbfa87da7fbdd7a9e8dd67844)]:
  - react-native-bundle-discovery-ui@2.9.0
  - react-native-bundle-discovery@2.9.0

## 2.8.0

### Patch Changes

- Updated dependencies [[`64fd3fd`](https://github.com/retyui/react-native-bundle-discovery/commit/64fd3fdb878fa539ed3c9f032588c61d301f61d1), [`3b2640f`](https://github.com/retyui/react-native-bundle-discovery/commit/3b2640ff010dd28e9f1dc3c1351d0b856b31cd1f)]:
  - react-native-bundle-discovery-ui@2.8.0
  - react-native-bundle-discovery@2.8.0

## 2.7.0

### Minor Changes

- [#16](https://github.com/retyui/react-native-bundle-discovery/pull/16) [`ac2af30`](https://github.com/retyui/react-native-bundle-discovery/commit/ac2af3063e3c4031ee026b58d4039e56f7152383) Thanks [@retyui](https://github.com/retyui)! - Rewrite in TypeScript and ship compiled JavaScript from `dist/` (with type definitions for `react-native-bundle-discovery` and the Rozenite plugin). Package entry points are unchanged; deep imports of internal files (e.g. `react-native-bundle-discovery/webpack.js`, `react-native-bundle-discovery-ui/.discoveryrc.js`) moved under `dist/`.

### Patch Changes

- Updated dependencies [[`ac2af30`](https://github.com/retyui/react-native-bundle-discovery/commit/ac2af3063e3c4031ee026b58d4039e56f7152383)]:
  - react-native-bundle-discovery@2.7.0
  - react-native-bundle-discovery-ui@2.7.0
