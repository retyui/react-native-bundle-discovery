const chalk = require("chalk");

const isRsdoctorReportPath = (reportPath) => {
  try {
    const reportJson = require(reportPath);
    return isRsdoctorReport(reportJson, reportPath);
  } catch {
    return false;
  }
};

const isRsdoctorReport = (reportJson, reportPath, noLogs) => {
  try {
    if (
      Array.isArray(reportJson?.data?.moduleGraph?.modules) ||
      Array.isArray(reportJson?.data?.packageGraph?.packages)
    ) {
      !noLogs &&
        console.info(
          `Detected ${chalk.red("rsdoctor")} format in the input file: ${chalk.green(reportPath)}`,
        );
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

module.exports = {
  isRsdoctorReport,
  isRsdoctorReportPath,
};
