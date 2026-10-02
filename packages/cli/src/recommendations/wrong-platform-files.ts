import type { PreparedReport, Recommendation } from "../types";

const OTHER_PLATFORM: Record<string, string | undefined> = {
  ios: "android",
  android: "ios",
};

// e.g. `is-android`, `isAndroid`, `is-ios`, `isIOS`
const PLATFORM_CHECK_PATTERN = /is[-_]?(android|ios)/gi;

function findWrongPlatformFiles(
  report: PreparedReport,
  otherPlatform: string,
): string[] {
  return report.modules
    .map((m) => m.path.replace(`${report.rootFolder}/`, ""))
    .filter((modulePath) =>
      modulePath?.replace(PLATFORM_CHECK_PATTERN, "").includes(otherPlatform),
    );
}

const recommendation: Recommendation = {
  id: "wrong-platform-files",
  title: "Exclude other platform files from the bundle",
  check: (report) => {
    const platform = report?.transformOptions?.platform;
    const otherPlatform = OTHER_PLATFORM[platform];

    if (!otherPlatform) {
      return null;
    }

    const wrongFiles = findWrongPlatformFiles(report, otherPlatform);

    if (wrongFiles.length === 0) {
      return null;
    }

    const sample = wrongFiles.slice(0, 5).join("\n - ");

    return {
      message: `Detected ${wrongFiles.length} file(s) with "${otherPlatform}" in the path in the ${platform} bundle.
These files are likely not used on ${platform} and can be excluded to save bundle size.
Example paths:\n - ${sample}`,
      packages: [],
      docsUrl: null,
    };
  },
};

export default recommendation;
