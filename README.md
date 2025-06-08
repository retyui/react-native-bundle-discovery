# react-native-bundle-discovery

<img width="800" src="https://github.com/user-attachments/assets/211145d4-8fe7-499b-a372-9d752e878772" />

> [!WARNING]
> Currently, everything is in a very early stage. The project is not yet ready for use.

### Setup:

#### 1. Install
```bash
yarn add -D react-native-bundle-discovery
```

#### 2. Add to your metro.config.js

```diff
// metro.config.js
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
+const {createSerializer} = require('react-native-bundle-discovery');

+const mySerializer = createSerializer({  
+  projectRoot: __dirname, 
   //^^^ ⚠️ WARNING: In a monorepo setup, this should point to the monorepo root,
   //                not the individual package directory.
+})


/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
-const config = {};
+const config = {
+  serializer: {
+    customSerializer: mySerializer
+  },
+};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

**Similar projects:**
- https://github.com/expo/atlas
- https://github.com/v3ron/expo-atlas-without-expo
- https://github.com/callstack/react-native-bundle-visualizer
- https://github.com/webpack-contrib/webpack-bundle-analyzer
- https://github.com/statoscope/statoscope
- https://github.com/relative-ci/bundle-stats/tree/master/packages/cli


**Links:**
- Build blocks for pages: https://discoveryjs.github.io/discovery/#views-showcase
- Jora syntax: https://discoveryjs.github.io/jora/#article:jora-syntax-operators
