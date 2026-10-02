import type { Recommendation } from "../types";
import deprecatedPackages from "./deprecated-packages";
import devFiles from "./dev-files";
import devOnlyPackages from "./dev-only-packages";
import duplicatePackages from "./duplicate-packages";
import reactNativeLinearGradient from "./linear-gradient";
import outdatedPackages from "./outdated-packages";
import packageJsonFiles from "./package-json-files";
import reactNativeRadialGradient from "./radial-gradient";
import inlinePlatformPlugin from "./rn-inline-plugin";
import abortControllerPolyfill from "./rn-issue-abort-controller";
import babelRuntimeInlineHelpers from "./rn-issue-babel-runtime";
import hermesTransformProfile from "./rn-issue-hermesv1-profile";
import promisePolyfill from "./rn-issue-promise-polyfill";
import workletsBundleMode from "./worklets-bundle-mode";
import wrongPlatformFiles from "./wrong-platform-files";

const recommendations: Recommendation[] = [
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

export default recommendations;
