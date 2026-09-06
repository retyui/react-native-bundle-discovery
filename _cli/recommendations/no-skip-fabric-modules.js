const REACT_NATIVE_RENDERER_PATH =
  "react-native/Libraries/Renderer/implementations/ReactNativeRenderer";
const REACT_FABRIC_PATH =
  "react-native/Libraries/Renderer/implementations/ReactFabric";

function hasModulePath(modules, targetPath) {
  return modules.some((module) => {
    const modulePath = module?.path;

    if (typeof modulePath !== "string") {
      return false;
    }

    return modulePath.includes(targetPath);
  });
}

module.exports = {
  id: "rn-renderer-implementation-does-not-match-architecture",
  title: "Keep only the renderer for the active React Native architecture",
  check: (report) => {
    const modules = report?.modules ?? [];
    const hasReactNativeRenderer = hasModulePath(
      modules,
      REACT_NATIVE_RENDERER_PATH,
    );
    const hasReactFabric = hasModulePath(modules, REACT_FABRIC_PATH);

    if (!hasReactNativeRenderer || !hasReactFabric) {
      return null;
    }

    return {
      message:
        "Bundle contains both legacy and Fabric renderer implementations. " +
        "Keep only the renderer for your active architecture by excluding the inactive files in `metro.config.js` with `serializer.processModuleFilter`.\n\n" +
        "If New Architecture is enabled, exclude `ReactNativeRenderer-dev.js` and `ReactNativeRenderer-prod.js`. " +
        "If you still use the Old Architecture, exclude `ReactFabric-dev.js` and `ReactFabric-prod.js`.\n\n" +
        "Example:\n" +
        "```js\n" +
        "module.exports = mergeConfig(defaultConfig, {\n" +
        "  serializer: {\n" +
        "    processModuleFilter(module) {\n" +
        "      const EXCLUDED_RENDERER_FILES = [\n" +
        "        'ReactNativeRenderer-dev.js',\n" +
        "        'ReactNativeRenderer-prod.js',\n" +
        "      ];\n\n" +
        "      const isExcludedRenderer = EXCLUDED_RENDERER_FILES.some((fileName) =>\n" +
        "        module.path.endsWith(fileName),\n" +
        "      );\n\n" +
        "      return !isExcludedRenderer;\n" +
        "    },\n" +
        "  },\n" +
        "});\n" +
        "```\n\n" +
        "Swap the file names to the `ReactFabric-*` files when you need to keep the legacy renderer instead.",
      packages: ["react-native"],
      docsUrl: null,
    };
  },
};
