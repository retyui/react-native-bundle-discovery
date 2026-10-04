import { getModulesSavings } from "./savings";
import type { PreparedReport, Recommendation } from "./types";

const devFileNamePattern = /\b(development|debug|dev|storybook)\b/i;

function findDevFilesInBundle(report: PreparedReport) {
  return report.modules.filter((module) =>
    devFileNamePattern.test(module?.path?.replace(report.rootFolder, "")),
  );
}

const recommendation: Recommendation = {
  id: "dev-files-in-production-bundle",
  title: "Exclude dev/debug files from production bundle",
  check: (report) => {
    const devFiles = findDevFilesInBundle(report);

    if (devFiles.length === 0) {
      return null;
    }

    const sample = devFiles
      .slice(0, 5)
      .map((module) => module.path.replace(report.rootFolder, ""))
      .join("\n - ");

    return {
      message: `Detected ${devFiles.length} dev/debug file(s) in the production bundle.
Files matching development|debug|dev|storybook should be excluded from release builds.
Example paths:\n - ${sample}`,
      packages: [],
      docsUrl: null,
      ...getModulesSavings(devFiles),
    };
  },
};

export default recommendation;
