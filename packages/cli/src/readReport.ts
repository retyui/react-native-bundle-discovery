import path from "node:path";
import {
  type PreparedReport,
  prepareReport,
} from "@react-native-bundle-discovery/shared";
import chalk from "chalk";

export function readBuildReport(
  filePath: string,
  format?: string,
): PreparedReport {
  try {
    // Resolve from current working directory to support relative CLI paths.
    const resolvedPath = path.resolve(filePath);
    // Runtime `require` of the user's JSON file (must not be bundled).
    const report: unknown = require(resolvedPath);
    // Machine-readable output must not be polluted by log lines.
    const noLogs = format === "json" || format === "markdown";
    return prepareReport(report, resolvedPath, noLogs);
  } catch (error) {
    console.error(chalk.red(`Error reading report file: ${filePath}`));
    console.error(error);
    process.exit(1);
  }
}
