const { isRsdoctorReport } = require("./isRsdoctorReport.js");
const { transformRSDoctorData } = require("./rsdoctor.js");

function normalizeReportData(report, reportPath, noLogs) {
  if (isRsdoctorReport(report, reportPath, noLogs)) {
    return transformRSDoctorData(report);
  }
  return report;
}

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

function prepareReport(_report, reportPath, noLogs) {
  const report = normalizeReportData(_report, reportPath, noLogs);
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
