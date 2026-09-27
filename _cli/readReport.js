const path = require("path");
const chalk = require("chalk");
const { prepareReport } = require("./prepare.js");

function readBuildReport(filePath, format) {
  try {
    // Resolve from current working directory to support relative CLI paths.
    const resolvedPath = path.resolve(filePath);
    const report = require(resolvedPath);
    // Machine-readable output must not be polluted by log lines.
    const noLogs = format === "json" || format === "markdown";
    return prepareReport(report, resolvedPath, noLogs);
  } catch (error) {
    console.error(chalk.red(`Error reading report file: ${filePath}`));
    console.error(error);
    process.exit(1);
  }
}

module.exports = {
  readBuildReport,
};
