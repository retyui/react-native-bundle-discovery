import {
  type EsbuildMetafile,
  isEsbuildMetafile,
  transformEsbuildMetafile,
} from "./esbuild";
import { isRsdoctorReport } from "./isRsdoctorReport";
import { type RsdoctorData, transformRSDoctorData } from "./rsdoctor";
import type { BundleReport, ReportModule, ReportPackage } from "./types";

/** Package entry after `prepareReport()` added the relative path and own size */
export interface PreparedPackage extends ReportPackage {
  path: string;
  sizeInBytes: number;
}

/** Report returned by `prepareReport()` */
export interface PreparedReport extends Omit<BundleReport, "packages"> {
  packages: PreparedPackage[];
  kind?: string;
}

function normalizeReportData(
  report: unknown,
  reportPath: string,
  noLogs?: boolean,
): BundleReport {
  if (isRsdoctorReport(report, reportPath, noLogs)) {
    return transformRSDoctorData(report as RsdoctorData);
  }
  if (isEsbuildMetafile(report, reportPath, noLogs)) {
    return transformEsbuildMetafile(report as EsbuildMetafile, reportPath);
  }
  return report as BundleReport;
}

/** Modules that belong to the package itself (without its nested `node_modules`) */
export function getPackageModules(
  report: Pick<BundleReport, "modules">,
  pkg: Pick<ReportPackage, "absolutePath">,
): ReportModule[] {
  const packagePrefix = `${pkg.absolutePath}/`;
  return report.modules.filter(
    (module) =>
      module.path.startsWith(packagePrefix) &&
      !module.path.slice(packagePrefix.length).includes("/node_modules/"),
  );
}

export function sumModulesSize(modules: ReportModule[]): number {
  return modules.reduce(
    (sum, module) => sum + (module.output?.sizeInBytes ?? 0),
    0,
  );
}

export function prepareReport(
  _report: unknown,
  reportPath: string,
  noLogs?: boolean,
): PreparedReport {
  const report = normalizeReportData(_report, reportPath, noLogs);
  const packages: PreparedPackage[] = report.packages.map((pkg) => {
    const sizeInBytes = sumModulesSize(getPackageModules(report, pkg));
    return {
      ...pkg,
      path: pkg.absolutePath.replace(`${report.rootFolder}/`, ""),
      sizeInBytes,
    };
  });

  // Mutates the loaded report in place (same as before the TS migration)
  return Object.assign(report, { packages });
}
