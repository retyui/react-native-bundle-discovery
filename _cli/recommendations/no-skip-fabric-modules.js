// era or Old + New Arch

// 1. if not New Arch enabled, skip fabric modules to avoid errors in the bundle
// processModuleFilter: function skipFabricModules(module) {
//   const FABRIC_RENDERER_FILES = [
//     'ReactNativeRenderer-prod.js',
//     'ReactNativeRenderer-dev.js',
//   ];
//   const isFabricModules = FABRIC_RENDERER_FILES.some((impl) =>
//     module.path.endsWith(impl),
//   );
//
//   return !isFabricModules;
// },

// 2. Test this too (https://www.clyr.co.jp/posts/react-native-0-74-new-features-migration-guide-2886)
// module.exports = mergeConfig(defaultConfig, {
//   serializer: {
//     processModuleFilter: (module) => !module.path.endsWith(".map")
