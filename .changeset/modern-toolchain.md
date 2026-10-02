---
"react-native-bundle-discovery": minor
"react-native-bundle-discovery-ui": minor
"react-native-bundle-discovery-cli": minor
"react-native-bundle-discovery-rozenite-plugin": minor
---

Rewrite in TypeScript and ship compiled JavaScript from `dist/` (with type definitions for `react-native-bundle-discovery` and the Rozenite plugin). Package entry points are unchanged; deep imports of internal files (e.g. `react-native-bundle-discovery/webpack.js`, `react-native-bundle-discovery-ui/.discoveryrc.js`) moved under `dist/`.
