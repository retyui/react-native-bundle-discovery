import {
  type BundleReport,
  isRsdoctorReport,
  transformRSDoctorData,
} from "@react-native-bundle-discovery/shared";
import type { PreparedPackage, PreparedReport } from "./types";

type RsdoctorData = Parameters<typeof transformRSDoctorData>[0];

function normalizeReportData(
  report: unknown,
  reportPath: string,
  noLogs?: boolean,
): BundleReport {
  if (isRsdoctorReport(report, reportPath, noLogs)) {
    return transformRSDoctorData(report as RsdoctorData);
  }
  return report as BundleReport;
}

function getSize(report: BundleReport, pkg: BundleReport["packages"][number]) {
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

export function prepareReport(
  _report: unknown,
  reportPath: string,
  noLogs?: boolean,
): PreparedReport {
  const report = normalizeReportData(_report, reportPath, noLogs);
  const packages: PreparedPackage[] = report.packages.map((pkg) => {
    const sizeInBytes = getSize(report, pkg);
    return {
      ...pkg,
      path: pkg.absolutePath.replace(`${report.rootFolder}/`, ""),
      sizeInBytes,
    };
  });

  // Mutates the loaded report in place (same as before the TS migration)
  return Object.assign(report, { packages });
}
