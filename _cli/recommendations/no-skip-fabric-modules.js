const { getReactNativeVersion, isVersionGte } = require("../utils.js");

const REACT_NATIVE_RENDERER_PATH =
  "react-native/Libraries/Renderer/shims/ReactNative.js";
const REACT_FABRIC_PATH =
  "react-native/Libraries/Renderer/shims/ReactFabric.js";

function hasModulePath(modules, targetPath) {
  return modules.some((module) => {
    return module?.path?.endsWith(targetPath);
  });
}

module.exports = {
  id: "rn-renderer-implementation-does-not-match-architecture",
  title: "Keep only the renderer for the active React Native architecture",
  check: (report) => {
    const packages = report.packages;
    const reactNativeVersion = getReactNativeVersion(packages);

    if (isVersionGte(reactNativeVersion, "0.86.0")) {
      return null;
    }

    const modules = report.modules;
    const hasReactNativeRenderer = hasModulePath(
      modules,
      REACT_NATIVE_RENDERER_PATH,
    );
    const hasReactFabric = hasModulePath(modules, REACT_FABRIC_PATH);

    if (!(hasReactNativeRenderer && hasReactFabric)) {
      return null;
    }

    return {
      message: `Bundle contains both Legacy and Fabric renderer implementations:
- ${REACT_NATIVE_RENDERER_PATH}
- ${REACT_FABRIC_PATH}

Keep only the renderer for your active architecture 
by excluding the inactive files in \`metro.config.js\` with \`resolver.resolveRequest\`.

Fix example:
\`\`\`js
// metro.config.js
const { createResolveRequest } = require('react-native-bundle-discovery');
const resolveRequest = createResolveRequest({ 
  removeOldRenderer: true, // true when NEW_ARCH ON
  removeNewRenderer: true, // true when NEW_ARCH OFF
});
const config = {
  resolver: { resolveRequest },
};
\`\`\``,
      packages: ["react-native"],
      docsUrl: null,
    };
  },
};
