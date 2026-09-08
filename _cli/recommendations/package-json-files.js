function findBundledDependencyPackageJsonFiles(report) {
  const modules = report.modules;

  return modules
    .map((module) => module?.path)
    .filter((modulePath) => modulePath?.endsWith("package.json"));
}

module.exports = {
  id: "bundled-package-json-files",
  title: "Avoid bundling dependency package.json files",
  check: (report) => {
    const packageJsonFiles = findBundledDependencyPackageJsonFiles(report);

    if (packageJsonFiles.length === 0) {
      return null;
    }

    const sample = packageJsonFiles.slice(0, 3).join(", ");
    return {
      message:
        `Detected ${packageJsonFiles.length} dependency package.json file(s) in the bundle. ` +
        "Remove package.json imports from app code and dependencies (patch packages from node_modules if needed). " +
        `Example paths: ${sample}`,
      packages: [],
      docsUrl: null,
    };
  },
};
