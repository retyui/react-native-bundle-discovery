import { getPackageGroups } from "./packageGroups";
import { type PreparedReport, prepareReport } from "./prepareReport";
import {
  type DeprecatedPackage,
  findDeprecatedPackages,
} from "./recommendations/deprecated-packages";
import type { BundleReport } from "./types";

export interface TransformOptionDiff {
  option: (typeof COMPARED_TRANSFORM_OPTIONS)[number];
  before: unknown;
  after: unknown;
}

export interface ModuleSizeChange {
  path: string;
  sizeInBytes: number;
  deltaInBytes: number;
}

export interface ModuleChange {
  path: string;
  beforeSizeInBytes: number;
  afterSizeInBytes: number;
  deltaInBytes: number;
}

export interface ModulesComparison {
  added: ModuleSizeChange[];
  removed: ModuleSizeChange[];
  changed: ModuleChange[];
}

export interface PackageByName {
  name: string;
  versions: string[];
  sizeInBytes: number;
}

export interface PackageVersionChange {
  name: string;
  beforeVersions: string[];
  afterVersions: string[];
  deltaInBytes: number;
}

export interface NewDuplicate {
  name: string;
  count: number;
  sizeInBytes: number;
  entries: { name: string; version: string; path: string }[];
}

export interface DeprecatedComparison {
  beforeCount: number;
  afterCount: number;
  added: DeprecatedPackage[];
}

export interface PackagesComparison {
  added: PackageByName[];
  removed: PackageByName[];
  versionChanges: PackageVersionChange[];
  newDuplicates: NewDuplicate[];
  deprecated: DeprecatedComparison;
}

export interface Contributor {
  name: string;
  deltaInBytes: number;
  note: string | null;
}

export interface ReportSummary {
  platform: string | null;
  sizeInBytes: number;
  modules: number;
  packages: number;
}

export interface ComparisonSummary {
  before: ReportSummary;
  after: ReportSummary;
  deltaInBytes: number;
  deltaPercent: number | null;
}

export interface Comparison {
  transformOptionsDiff: TransformOptionDiff[];
  summary: ComparisonSummary;
  modules: ModulesComparison;
  packages: PackagesComparison;
  biggestContributors: Contributor[];
}

// Options that make two bundles incomparable when they differ.
const COMPARED_TRANSFORM_OPTIONS = [
  // "platform" - for ppl who interesting in comparing iOS vs Android builds in general
  "dev",
  "minify",
  "unstable_transformProfile",
] as const;
const CONTRIBUTORS_LIMIT = 5;

/**
 * Makes paths comparable between machines and package managers:
 * `/Users/i/app/src/App.js` -> `src/App.js`
 * `/ci/app/node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/get.js` -> `node_modules/lodash/get.js`
 */
export function normalizePath(
  absolutePath: string | null | undefined,
  rootFolder: string | null | undefined,
): string {
  const value = absolutePath ?? "<unknown>";
  const rootPrefix = rootFolder ? `${rootFolder}/` : null;
  const relativePath =
    rootPrefix && value.startsWith(rootPrefix)
      ? value.slice(rootPrefix.length)
      : value;
  return relativePath.replace(
    /node_modules\/\.pnpm\/[^/]+\/node_modules\//g,
    "node_modules/",
  );
}

/**
 * `node_modules/@babel/runtime/helpers/createClass.js` -> `@babel/runtime`
 * `src/screens/Home/index.js` -> `src/screens`
 */
function getContributorName(modulePath: string): string {
  const marker = "node_modules/";
  const index = modulePath.lastIndexOf(marker);
  if (index !== -1) {
    const parts = modulePath.slice(index + marker.length).split("/");
    return parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  }
  const dir = modulePath.split("/").slice(0, -1).slice(0, 2).join("/");
  return dir || modulePath;
}

function getTotalSize(report: PreparedReport): number {
  return report.modules.reduce(
    (sum, module) => sum + (module?.output?.sizeInBytes ?? 0),
    0,
  );
}

function getTransformOptionsDiff(
  before: PreparedReport,
  after: PreparedReport,
): TransformOptionDiff[] {
  if (!before.transformOptions || !after.transformOptions) {
    return [];
  }
  return COMPARED_TRANSFORM_OPTIONS.filter(
    (option) =>
      before.transformOptions[option] !== after.transformOptions[option],
  ).map((option) => ({
    option,
    before: before.transformOptions[option],
    after: after.transformOptions[option],
  }));
}

function getModuleSizes(report: PreparedReport): Map<string, number> {
  const sizes = new Map<string, number>();
  report.modules.forEach((module) => {
    const modulePath = normalizePath(module?.path, report.rootFolder);
    // Different pnpm copies can collapse into one path, so sum them up.
    sizes.set(
      modulePath,
      (sizes.get(modulePath) ?? 0) + (module?.output?.sizeInBytes ?? 0),
    );
  });
  return sizes;
}

function compareModules(
  before: PreparedReport,
  after: PreparedReport,
): ModulesComparison {
  const beforeSizes = getModuleSizes(before);
  const afterSizes = getModuleSizes(after);
  const added: ModuleSizeChange[] = [];
  const removed: ModuleSizeChange[] = [];
  const changed: ModuleChange[] = [];

  afterSizes.forEach((sizeInBytes, path) => {
    const beforeSizeInBytes = beforeSizes.get(path);
    if (beforeSizeInBytes === undefined) {
      added.push({ path, sizeInBytes, deltaInBytes: sizeInBytes });
      return;
    }
    if (beforeSizeInBytes !== sizeInBytes) {
      changed.push({
        path,
        beforeSizeInBytes,
        afterSizeInBytes: sizeInBytes,
        deltaInBytes: sizeInBytes - beforeSizeInBytes,
      });
    }
  });

  beforeSizes.forEach((sizeInBytes, path) => {
    if (!afterSizes.has(path)) {
      removed.push({ path, sizeInBytes, deltaInBytes: -sizeInBytes });
    }
  });

  added.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
  removed.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
  changed.sort((a, b) => Math.abs(b.deltaInBytes) - Math.abs(a.deltaInBytes));

  return { added, removed, changed };
}

function getPackagesByName(report: PreparedReport): Map<string, PackageByName> {
  const packages = new Map<string, PackageByName>();
  report.packages.forEach((pkg) => {
    const name = pkg?.name ?? "<unknown>";
    let entry = packages.get(name);
    if (!entry) {
      entry = { name, versions: [], sizeInBytes: 0 };
      packages.set(name, entry);
    }
    entry.versions.push(pkg?.version ?? "<unknown>");
    entry.sizeInBytes += pkg?.sizeInBytes ?? 0;
  });
  packages.forEach((entry) => {
    entry.versions = Array.from(new Set(entry.versions)).sort();
  });
  return packages;
}

function getNewDuplicates(
  before: PreparedReport,
  after: PreparedReport,
): NewDuplicate[] {
  const beforeGroups = new Map(
    getPackageGroups(before).map((group) => [group.name, group]),
  );

  return getPackageGroups(after)
    .filter(
      (group) =>
        group.entries.length > 1 &&
        group.entries.length >
          (beforeGroups.get(group.name)?.entries.length ?? 0),
    )
    .map((group) => ({
      name: group.name,
      count: group.entries.length,
      sizeInBytes: group.totalSizeInBytes,
      entries: group.entries.map((entry) => ({
        name: entry.name,
        version: entry.version,
        path: normalizePath(entry.path, null),
      })),
    }));
}

function compareDeprecated(
  before: PreparedReport,
  after: PreparedReport,
): DeprecatedComparison {
  const beforeDeprecated = findDeprecatedPackages(before);
  const afterDeprecated = findDeprecatedPackages(after);
  const beforeIds = new Set(beforeDeprecated.map(({ id }) => id));

  return {
    beforeCount: beforeDeprecated.length,
    afterCount: afterDeprecated.length,
    added: afterDeprecated.filter(({ id }) => !beforeIds.has(id)),
  };
}

function comparePackages(
  before: PreparedReport,
  after: PreparedReport,
): PackagesComparison {
  const beforePackages = getPackagesByName(before);
  const afterPackages = getPackagesByName(after);
  const added: PackageByName[] = [];
  const removed: PackageByName[] = [];
  const versionChanges: PackageVersionChange[] = [];

  afterPackages.forEach((pkg, name) => {
    const beforePkg = beforePackages.get(name);
    if (!beforePkg) {
      added.push(pkg);
      return;
    }
    if (beforePkg.versions.join() !== pkg.versions.join()) {
      versionChanges.push({
        name,
        beforeVersions: beforePkg.versions,
        afterVersions: pkg.versions,
        deltaInBytes: pkg.sizeInBytes - beforePkg.sizeInBytes,
      });
    }
  });

  beforePackages.forEach((pkg, name) => {
    if (!afterPackages.has(name)) {
      removed.push(pkg);
    }
  });

  added.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
  removed.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
  versionChanges.sort(
    (a, b) => Math.abs(b.deltaInBytes) - Math.abs(a.deltaInBytes),
  );

  return {
    added,
    removed,
    versionChanges,
    newDuplicates: getNewDuplicates(before, after),
    deprecated: compareDeprecated(before, after),
  };
}

// Groups module deltas by package (or first-party folder) to explain growth.
function getBiggestContributors(
  modules: ModulesComparison,
  packages: PackagesComparison,
): Contributor[] {
  const deltas = new Map<string, number>();
  [...modules.added, ...modules.removed, ...modules.changed].forEach(
    (module) => {
      const name = getContributorName(module.path);
      deltas.set(name, (deltas.get(name) ?? 0) + module.deltaInBytes);
    },
  );

  const addedNames = new Set(packages.added.map(({ name }) => name));
  const versionChanges = new Map(
    packages.versionChanges.map((change) => [change.name, change]),
  );

  return Array.from(deltas.entries())
    .filter(([, deltaInBytes]) => deltaInBytes > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CONTRIBUTORS_LIMIT)
    .map(([name, deltaInBytes]) => {
      let note: string | null = null;
      const change = versionChanges.get(name);
      if (addedNames.has(name)) {
        note = "new package";
      } else if (change) {
        note = `${change.beforeVersions.join(", ")} → ${change.afterVersions.join(", ")}`;
      }
      return { name, deltaInBytes, note };
    });
}

// Some reports list the same package (same path) more than once.
function withUniquePackages(report: PreparedReport): PreparedReport {
  const seen = new Set<string>();
  return {
    ...report,
    packages: report.packages.filter((pkg) => {
      const key = `${pkg?.name}@${pkg?.absolutePath ?? pkg?.path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  };
}

export function compareReports(
  _before: PreparedReport,
  _after: PreparedReport,
): Comparison {
  const before = withUniquePackages(_before);
  const after = withUniquePackages(_after);
  const beforeSizeInBytes = getTotalSize(before);
  const afterSizeInBytes = getTotalSize(after);
  const modules = compareModules(before, after);
  const packages = comparePackages(before, after);

  return {
    transformOptionsDiff: getTransformOptionsDiff(before, after),
    summary: {
      before: {
        platform: before.transformOptions?.platform ?? null,
        sizeInBytes: beforeSizeInBytes,
        modules: before.modules.length,
        packages: before.packages.length,
      },
      after: {
        platform: after.transformOptions?.platform ?? null,
        sizeInBytes: afterSizeInBytes,
        modules: after.modules.length,
        packages: after.packages.length,
      },
      deltaInBytes: afterSizeInBytes - beforeSizeInBytes,
      deltaPercent:
        beforeSizeInBytes > 0
          ? ((afterSizeInBytes - beforeSizeInBytes) / beforeSizeInBytes) * 100
          : null,
    },
    modules,
    packages,
    biggestContributors: getBiggestContributors(modules, packages),
  };
}

/** Code of a "before" module, to diff it with the "after" one in the UI */
export interface BeforeModuleCode {
  source: string;
  output: string;
}

export interface ReportWithComparison extends BundleReport {
  comparison: Comparison & {
    beforeFile: string;
    /** Code of the changed modules in the "before" report, by (normalized) path */
    beforeModules: Record<string, BeforeModuleCode>;
  };
}

function getBeforeModules(
  before: PreparedReport,
  changed: ModuleChange[],
): Record<string, BeforeModuleCode> {
  const paths = new Set(changed.map((module) => module.path));
  const result: Record<string, BeforeModuleCode> = {};
  before.modules.forEach((module) => {
    const modulePath = normalizePath(module?.path, before.rootFolder);
    if (paths.has(modulePath) && !result[modulePath]) {
      result[modulePath] = {
        source: module.source?.code ?? "",
        output: module.output?.code ?? "",
      };
    }
  });
  return result;
}

/** Attaches the diff against a "before" report (raw JSON of any supported format) */
export function withComparison<T extends BundleReport>(
  report: T,
  before: unknown,
  beforePath: string,
): T & ReportWithComparison {
  const beforeReport = prepareReport(before, beforePath, true);
  const comparison = compareReports(
    beforeReport,
    // A shallow copy: `prepareReport()` replaces `packages` of the given object
    prepareReport({ ...report }, "", true),
  );
  return Object.assign(report, {
    comparison: {
      ...comparison,
      beforeFile: beforePath.split("/").pop() ?? beforePath,
      beforeModules: getBeforeModules(beforeReport, comparison.modules.changed),
    },
  });
}
