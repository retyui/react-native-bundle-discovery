const reactNativeLinearGradient = require("./linear-gradient.js");
const reactNativeRadialGradient = require("./radial-gradient.js");
const duplicatePackages = require("./duplicate-packages.js");
const abortControllerPolyfill = require("./rn-issue-abort-controller.js");
const babelRuntimeInlineHelpers = require("./rn-issue-babel-runtime.js");
const hermesTransformProfile = require("./rn-issue-hermesv1-profile.js");
const inlinePlatformPlugin = require("./rn-inline-plugin.js");
const promisePolyfill = require("./rn-issue-promise-polyfill.js");
const devOnlyPackages = require("./dev-only-packages.js");
const packageJsonFiles = require("./package-json-files.js");
const devFiles = require("./dev-files.js");
const deprecatedPackages = require("./deprecated-packages.js");
const outdatedPackages = require("./outdated-packages.js");
const workletsBundleMode = require("./worklets-bundle-mode.js");
const wrongPlatformFiles = require("./wrong-platform-files.js");

module.exports = [
  reactNativeLinearGradient,
  reactNativeRadialGradient,
  duplicatePackages,
  abortControllerPolyfill,
  babelRuntimeInlineHelpers,
  hermesTransformProfile,
  inlinePlatformPlugin,
  promisePolyfill,
  devOnlyPackages,
  packageJsonFiles,
  devFiles,
  deprecatedPackages,
  outdatedPackages,
  workletsBundleMode,
  wrongPlatformFiles,
];
