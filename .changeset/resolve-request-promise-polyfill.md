---
"react-native-bundle-discovery": minor
---

New `removePromisePolyfill` option for `createResolveRequest`: removes the unused `react-native/Libraries/Promise.js` module from release bundles (Hermes provides `Promise` out of the box). The "Remove Promise polyfills" recommendation already suggested this option, but `createResolveRequest` ignored it before.
