# react-native-bundle-discovery

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



**Links:**
- Build blocks for pages: https://discoveryjs.github.io/discovery/#views-showcase
- Jora syntax: https://discoveryjs.github.io/jora/#article:jora-syntax-operators



**TODO:**
- [x] Search/filters
- [ ] bug: Code size is diff. treemap != badge info (BECAUSE no duplicated modules in treemap)
- [ ] Diff page (to compare two versions bundle)
- [ ] Map based on the coverage (https://x.com/chromedevtools/status/1095411723161354240?lang=en)
- Static website (like  https://statoscope.tech)
  - [ ] website
  - [ ] auto deploy
  - [ ] drag and drop `stats.json`
- [x] Large tree maps https://www.highcharts.com/demo/highcharts/treemap-large-dataset or https://github.com/evmar/webtreemap
- Reports:
  - [ ] top 10 largest modules
  - [ ] top 10 largest files
  - [ ] Dead code detection (as example ios only code in an android bundle, never used exports, etc ...)
  - [x] Duplicate modules detection
  - [ ] Custom reports
- CI/CD reports 
 - [ ] changes in bundle size (size, files, modules)
