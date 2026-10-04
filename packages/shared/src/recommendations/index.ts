import { type PreparedReport, prepareReport } from "../prepareReport";
import type { BundleReport } from "../types";
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
import type { Recommendation, RecommendationFinding } from "./types";
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

export function collectRecommendations(
  report: PreparedReport,
): RecommendationFinding[] {
  return recommendations.flatMap((recommendation) => {
    const finding = recommendation.check(report);
    if (!finding) {
      return [];
    }

    return (Array.isArray(finding) ? finding : [finding]).map((f) => {
      return {
        id: recommendation.id,
        title: recommendation.title,
        ...f,
      };
    });
  });
}

export interface ReportWithRecommendations extends BundleReport {
  /** `null` for dev bundles: recommendations are made for production only */
  recommendations: RecommendationFinding[] | null;
}

// Used by the UI to show the same recommendations as the `analyze` CLI command
export function withRecommendations(
  report: BundleReport,
): ReportWithRecommendations {
  return Object.assign(report, {
    recommendations:
      report.transformOptions?.dev === false
        ? // A shallow copy: `prepareReport()` replaces `packages` of the given object
          collectRecommendations(prepareReport({ ...report }, "", true))
        : null,
  });
}
