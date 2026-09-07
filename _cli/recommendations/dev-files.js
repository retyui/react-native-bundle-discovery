const devFileNamePattern = /\b(development|debug|dev|storybook)\b/i;

function findDevFilesInBundle(report) {
  const modules = report?.modules ?? [];

  return modules
    .map((module) => module?.path)
    .filter((modulePath) => devFileNamePattern?.test(modulePath));
}

module.exports = {
  id: "dev-files-in-production-bundle",
  title: "Exclude dev/debug files from production bundle",
  check: (report) => {
    const devFiles = findDevFilesInBundle(report);

    if (devFiles.length === 0) {
      return null;
    }

    const sample = devFiles.slice(0, 5).join(", ");

    return {
      message:
        `Detected ${devFiles.length} dev/debug file(s) in the production bundle. ` +
        "Files matching development|debug|dev|storybook should be excluded from release builds. " +
        `Example paths: ${sample}`,
      packages: [],
      docsUrl: null,
    };
  },
};
