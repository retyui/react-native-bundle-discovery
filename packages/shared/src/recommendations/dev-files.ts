import { getModulesSavings } from "./savings";
import type { PreparedReport, Recommendation } from "./types";

const devFileNamePattern = /\b(development|debug|dev|storybook)\b/i;
// e.g. `src/__fixtures__/user.json`, `src/__mocks__/api.ts`, `src/api/mock.tsx`,
// `src/api/mocks.ts`, `src/api/user.mock.ts`
const testFilePattern = /\/__(fixtures|mocks)__\/|[/.]mocks?\.(ts|js)x?$/;

function findDevFilesInBundle(report: PreparedReport) {
  return report.modules.filter((module) => {
    const path = module?.path?.replace(report.rootFolder, "");
    return devFileNamePattern.test(path) || testFilePattern.test(path);
  });
}

const recommendation: Recommendation = {
  id: "dev-files-in-production-bundle",
  title: "Exclude dev/debug/mock files from production bundle",
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
      message: `Detected ${devFiles.length} dev/debug/mock file(s) in the production bundle.
Files matching development|debug|dev|storybook, files in __fixtures__ or __mocks__ folders and mock(s)/*.mock(s) files should be excluded from release builds.
Example paths:\n - ${sample}`,
      packages: [],
      docsUrl: null,
      ...getModulesSavings(devFiles),
    };
  },
};

export default recommendation;
