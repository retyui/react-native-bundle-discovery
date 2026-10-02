import chalk from "chalk";

export const isRsdoctorReport = (
  // biome-ignore lint/suspicious/noExplicitAny: arbitrary JSON input
  reportJson: any,
  reportPath: string,
  noLogs?: boolean,
): boolean => {
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

export const isRsdoctorReportPath = (reportPath: string): boolean => {
  try {
    const reportJson = require(reportPath);
    return isRsdoctorReport(reportJson, reportPath);
  } catch {
    return false;
  }
};
