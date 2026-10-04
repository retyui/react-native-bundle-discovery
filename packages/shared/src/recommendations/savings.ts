import { getPackageModules, sumModulesSize } from "../prepareReport";
import type { ReportModule, ReportPackage } from "../types";
import type { Finding, PreparedReport } from "./types";

type Savings = Required<Pick<Finding, "sizeInBytes" | "modules">>;

// Bytes saved if the given modules are removed from the bundle
export function getModulesSavings(modules: ReportModule[]): Savings {
  const unique = Array.from(new Set(modules));
  return {
    sizeInBytes: sumModulesSize(unique),
    modules: unique.map((module) => module.path),
  };
}

// Bytes saved if the given packages are removed from the bundle
export function getPackagesSavings(
  report: PreparedReport,
  packages: Pick<ReportPackage, "absolutePath">[],
): Savings {
  return getModulesSavings(
    packages.flatMap((pkg) => getPackageModules(report, pkg)),
  );
}
