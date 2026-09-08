function getSize(report, pkg) {
  let size = 0;
  const packagePrefix = `${pkg.absolutePath}/`;
  report.modules.forEach((module) => {
    if (!module.path.startsWith(packagePrefix)) {
      return;
    }
    const relativePath = module.path.slice(packagePrefix.length);
    if (!relativePath.includes("/node_modules/")) {
      size += module.output?.sizeInBytes ?? 0;
    }
  });
  return size;
}

function prepareReport(report) {
  report.packages = report.packages.map((pkg) => {
    const sizeInBytes = getSize(report, pkg);
    return {
      ...pkg,
      path: pkg.absolutePath.replace(report.rootFolder + "/", ""),
      sizeInBytes,
    };
  });

  return report;
}

module.exports = {
  prepareReport,
};
