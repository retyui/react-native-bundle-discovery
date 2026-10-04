import fs from "node:fs";
import {
  type DeprecatedPackage,
  findDeprecatedPackages,
  getPackageGroups,
} from "@react-native-bundle-discovery/shared";
import chalk from "chalk";
import { readBuildReport } from "./readReport";
import type { ByteLimit, PreparedReport, SizeLimit } from "./types";
import { formatBytes } from "./utils";

export type CompareFormat = "json" | "markdown" | "default";

interface TransformOptionDiff {
  option: (typeof COMPARED_TRANSFORM_OPTIONS)[number];
  before: unknown;
  after: unknown;
}

interface ModuleSizeChange {
  path: string;
  sizeInBytes: number;
  deltaInBytes: number;
}

interface ModuleChange {
  path: string;
  beforeSizeInBytes: number;
  afterSizeInBytes: number;
  deltaInBytes: number;
}

interface ModulesComparison {
  added: ModuleSizeChange[];
  removed: ModuleSizeChange[];
  changed: ModuleChange[];
}

interface PackageByName {
  name: string;
  versions: string[];
  sizeInBytes: number;
}

interface PackageVersionChange {
  name: string;
  beforeVersions: string[];
  afterVersions: string[];
  deltaInBytes: number;
}

interface NewDuplicate {
  name: string;
  count: number;
  sizeInBytes: number;
  entries: { name: string; version: string; path: string }[];
}

interface DeprecatedComparison {
  beforeCount: number;
  afterCount: number;
  added: DeprecatedPackage[];
}

interface PackagesComparison {
  added: PackageByName[];
  removed: PackageByName[];
  versionChanges: PackageVersionChange[];
  newDuplicates: NewDuplicate[];
  deprecated: DeprecatedComparison;
}

interface Contributor {
  name: string;
  deltaInBytes: number;
  note: string | null;
}

interface ReportSummary {
  platform: string | null;
  sizeInBytes: number;
  modules: number;
  packages: number;
}

interface ComparisonSummary {
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

interface Check {
  rule: string;
  isSizeRule?: boolean;
  passed: boolean;
  message: string;
}

interface CheckOptions {
  failOnIncrease?: SizeLimit | null;
  maxSize?: ByteLimit | null;
  failOn?: string[];
}

interface PrintOptions {
  beforePath: string;
  afterPath: string;
  limit: number;
}

// Options that make two bundles incomparable when they differ.
const COMPARED_TRANSFORM_OPTIONS = [
  // "platform" - for ppl who interesting in comparing iOS vs Android builds in general
  "dev",
  "minify",
  "unstable_transformProfile",
] as const;
export const FAIL_ON_RULES: string[] = ["new-duplicates", "new-deprecated"];
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

function sumBy<K extends string>(items: Record<K, number>[], key: K): number {
  return items.reduce((sum, item) => sum + item[key], 0);
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

function formatDelta(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  return `${bytes > 0 ? "+" : "-"}${formatBytes(Math.abs(bytes))}`;
}

function formatPercent(percent: number | null): string {
  if (percent === null) return "n/a";
  const rounded = Math.round(percent * 100) / 100;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function formatCountDelta(before: number, after: number): string {
  const delta = after - before;
  return delta > 0 ? `+${delta}` : String(delta);
}

function formatPlatform(platform: string | null): string {
  return platform ?? "unknown";
}

// "ios" when both are the same, "ios → android" otherwise
function formatPlatformChange(summary: ComparisonSummary): string {
  const before = formatPlatform(summary.before.platform);
  const after = formatPlatform(summary.after.platform);
  return before === after ? before : `${before} → ${after}`;
}

function formatVersions(versions: string[]): string {
  return versions.join(", ");
}

function runChecks(
  comparison: Comparison,
  { failOnIncrease, maxSize, failOn = [] }: CheckOptions,
): Check[] {
  const { summary, packages } = comparison;
  const checks: Check[] = [];

  if (failOnIncrease?.bytes !== undefined) {
    checks.push({
      rule: "fail-on-increase",
      isSizeRule: true,
      passed: summary.deltaInBytes <= failOnIncrease.bytes,
      message: `Bundle size changed by ${formatDelta(summary.deltaInBytes)} (limit: +${formatBytes(failOnIncrease.bytes)})`,
    });
  }

  if (failOnIncrease?.percent !== undefined) {
    checks.push({
      rule: "fail-on-increase",
      isSizeRule: true,
      passed:
        summary.deltaPercent === null ||
        summary.deltaPercent <= failOnIncrease.percent,
      message: `Bundle size changed by ${formatPercent(summary.deltaPercent)} (limit: +${failOnIncrease.percent}%)`,
    });
  }

  if (maxSize) {
    checks.push({
      rule: "max-size",
      isSizeRule: true,
      passed: summary.after.sizeInBytes <= maxSize.bytes,
      message: `Bundle size is ${formatBytes(summary.after.sizeInBytes)} (limit: ${formatBytes(maxSize.bytes)})`,
    });
  }

  if (failOn.includes("new-duplicates")) {
    const names = packages.newDuplicates.map(({ name }) => name);
    checks.push({
      rule: "new-duplicates",
      passed: names.length === 0,
      message:
        names.length === 0
          ? "No new duplicate packages"
          : `${names.length} new duplicate package(s): ${names.join(", ")}`,
    });
  }

  if (failOn.includes("new-deprecated")) {
    const ids = packages.deprecated.added.map(({ id }) => id);
    checks.push({
      rule: "new-deprecated",
      passed: ids.length === 0,
      message:
        ids.length === 0
          ? "No new deprecated packages"
          : `${ids.length} new deprecated package(s): ${ids.join(", ")}`,
    });
  }

  return checks;
}

function getFixHint(failedChecks: Check[]): string {
  const hints: string[] = [];
  if (failedChecks.some(({ rule }) => rule === "fail-on-increase")) {
    hints.push("raise --fail-on-increase");
  }
  if (failedChecks.some(({ rule }) => rule === "max-size")) {
    hints.push("raise --max-size");
  }
  if (
    failedChecks.some(
      ({ rule }) => rule === "new-duplicates" || rule === "new-deprecated",
    )
  ) {
    hints.push("fix the packages above or remove the rule from --fail-on");
  }
  return `Intentional? ${hints.join(", ")}.`;
}

function shouldShowContributors(
  checks: Check[],
  contributors: Contributor[],
): boolean {
  return (
    contributors.length > 0 &&
    checks.some(({ passed, isSizeRule }) => !passed && isSizeRule)
  );
}

// ---------- default (terminal) format ----------

function printHiddenNote(total: number, shown: number, indent = "    ") {
  if (total > shown) {
    console.log(
      chalk.dim(
        `${indent}... and ${total - shown} more. Use --limit <n> to show more (--limit 0 shows all).`,
      ),
    );
  }
}

function colorDelta(bytes: number): string {
  const text = formatDelta(bytes);
  if (bytes > 0) return chalk.red(text);
  if (bytes < 0) return chalk.green(text);
  return chalk.dim(text);
}

function printDefaultList<T>(
  title: string,
  items: T[],
  limit: number,
  printItem: (item: T) => void,
) {
  if (items.length === 0) return;
  console.log(`  ${chalk.bold(title)}`);
  const shown = limit > 0 ? items.slice(0, limit) : items;
  shown.forEach(printItem);
  printHiddenNote(items.length, shown.length);
}

function printDefaultFormat(
  comparison: Comparison,
  checks: Check[],
  { beforePath, afterPath, limit }: PrintOptions,
) {
  const { transformOptionsDiff, summary, modules, packages } = comparison;

  console.log(chalk.bold.cyan("Bundle size comparison"));
  console.log(`${chalk.dim("Before:")} ${chalk.cyan(beforePath)}`);
  console.log(`${chalk.dim("After:")}  ${chalk.cyan(afterPath)}`);

  if (transformOptionsDiff.length > 0) {
    console.log();
    console.log(
      chalk.bold.yellow(
        "⚠ Reports were built with different transform options, size comparison may be misleading:",
      ),
    );
    transformOptionsDiff.forEach(({ option, before, after }) => {
      console.log(
        chalk.yellow(`  ${option}: ${String(before)} → ${String(after)}`),
      );
    });
  }

  console.log();
  console.log(chalk.bold("Summary"));
  console.log(`  Platform:   ${formatPlatformChange(summary)}`);
  console.log(
    `  Total size: ${formatBytes(summary.before.sizeInBytes)} → ${chalk.whiteBright(formatBytes(summary.after.sizeInBytes))} (${colorDelta(summary.deltaInBytes)}, ${formatPercent(summary.deltaPercent)})`,
  );
  console.log(
    `  Modules:    ${summary.before.modules} → ${summary.after.modules} (${formatCountDelta(summary.before.modules, summary.after.modules)})`,
  );
  console.log(
    `  Packages:   ${summary.before.packages} → ${summary.after.packages} (${formatCountDelta(summary.before.packages, summary.after.packages)})`,
  );

  console.log();
  console.log(chalk.bold("Packages"));
  const hasPackageChanges =
    packages.added.length > 0 ||
    packages.removed.length > 0 ||
    packages.versionChanges.length > 0 ||
    packages.newDuplicates.length > 0;
  if (!hasPackageChanges) {
    console.log(chalk.dim("  No package changes"));
  }
  printDefaultList(
    `Added (${packages.added.length}):`,
    packages.added,
    limit,
    (pkg) =>
      console.log(
        `    ${chalk.red("+")} ${chalk.whiteBright(`${pkg.name}@${formatVersions(pkg.versions)}`)} - ${chalk.magenta(formatBytes(pkg.sizeInBytes))}`,
      ),
  );
  printDefaultList(
    `Removed (${packages.removed.length}):`,
    packages.removed,
    limit,
    (pkg) =>
      console.log(
        `    ${chalk.green("-")} ${chalk.whiteBright(`${pkg.name}@${formatVersions(pkg.versions)}`)} - ${chalk.magenta(formatBytes(pkg.sizeInBytes))}`,
      ),
  );
  printDefaultList(
    `Version changes (${packages.versionChanges.length}):`,
    packages.versionChanges,
    limit,
    (change) =>
      console.log(
        `    ${chalk.yellow("~")} ${chalk.whiteBright(change.name)} ${formatVersions(change.beforeVersions)} → ${formatVersions(change.afterVersions)} (${colorDelta(change.deltaInBytes)})`,
      ),
  );
  printDefaultList(
    `New duplicates (${packages.newDuplicates.length}):`,
    packages.newDuplicates,
    limit,
    (duplicate) => {
      console.log(
        `    ${chalk.yellowBright(duplicate.name)} ${chalk.black.bgYellow(` DUPLICATE x${duplicate.count} `)}`,
      );
      duplicate.entries.forEach((entry) => {
        console.log(
          `      ${chalk.gray("-")} ${entry.name}@${entry.version} ${chalk.gray(`(${entry.path})`)}`,
        );
      });
    },
  );
  const { deprecated } = packages;
  console.log(
    `  ${chalk.bold("Deprecated:")} ${deprecated.beforeCount} → ${deprecated.afterCount}${deprecated.added.length > 0 ? chalk.yellow(` (${deprecated.added.length} new)`) : ""}`,
  );
  deprecated.added.forEach(({ id, reason, latestVersion }) => {
    const latest = latestVersion
      ? chalk.gray(` (latest: ${latestVersion})`)
      : "";
    console.log(
      `    ${chalk.yellow("!")} ${chalk.whiteBright(id)}${latest}${reason ? `: ${reason}` : ""}`,
    );
  });

  console.log();
  console.log(chalk.bold("Modules"));
  if (
    modules.added.length === 0 &&
    modules.removed.length === 0 &&
    modules.changed.length === 0
  ) {
    console.log(chalk.dim("  No module changes"));
  }
  printDefaultList(
    `Added (${modules.added.length}, ${formatDelta(sumBy(modules.added, "deltaInBytes"))}):`,
    modules.added,
    limit,
    (module) =>
      console.log(
        `    ${chalk.red("+")} ${chalk.whiteBright(module.path)} - ${chalk.magenta(formatBytes(module.sizeInBytes))}`,
      ),
  );
  printDefaultList(
    `Removed (${modules.removed.length}, ${formatDelta(sumBy(modules.removed, "deltaInBytes"))}):`,
    modules.removed,
    limit,
    (module) =>
      console.log(
        `    ${chalk.green("-")} ${chalk.whiteBright(module.path)} - ${chalk.magenta(formatBytes(module.sizeInBytes))}`,
      ),
  );
  printDefaultList(
    `Changed (${modules.changed.length}, net ${formatDelta(sumBy(modules.changed, "deltaInBytes"))}):`,
    modules.changed,
    limit,
    (module) =>
      console.log(
        `    ${module.deltaInBytes > 0 ? chalk.red("↑") : chalk.green("↓")} ${chalk.whiteBright(module.path)} ${formatBytes(module.beforeSizeInBytes)} → ${formatBytes(module.afterSizeInBytes)} (${colorDelta(module.deltaInBytes)})`,
      ),
  );

  if (checks.length === 0) return;

  const failedChecks = checks.filter(({ passed }) => !passed);
  console.log();
  console.log(
    failedChecks.length > 0
      ? chalk.bold.red("✖ Bundle checks failed")
      : chalk.bold.green("✔ Bundle checks passed"),
  );
  checks.forEach(({ passed, message }) => {
    console.log(
      passed
        ? `  ${chalk.green("✔")} ${message}`
        : `  ${chalk.red("✖")} ${chalk.red(message)}`,
    );
  });

  if (shouldShowContributors(checks, comparison.biggestContributors)) {
    console.log();
    console.log(`  ${chalk.bold("Biggest contributors:")}`);
    comparison.biggestContributors.forEach(({ name, deltaInBytes, note }) => {
      console.log(
        `    ${chalk.whiteBright(name)} ${colorDelta(deltaInBytes)}${note ? chalk.gray(` (${note})`) : ""}`,
      );
    });
  }

  if (failedChecks.length > 0) {
    console.log();
    console.log(chalk.dim(`  ${getFixHint(failedChecks)}`));
  }
}

// ---------- markdown format ----------

function mdCell(value: unknown): string {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function mdCode(value: unknown): string {
  return `\`${mdCell(value)}\``;
}

function mdTable(
  headers: string[],
  rows: (string | number)[][],
  alignRight: number[] = [],
): string {
  const separator = headers.map((_, index) =>
    alignRight.includes(index) ? "---:" : "---",
  );
  return [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(mdCell).join(" | ")} |`),
  ].join("\n");
}

function mdDeltaEmoji(bytes: number): string {
  if (bytes > 0) return "📈 ";
  if (bytes < 0) return "📉 ";
  return "";
}

function mdDetails<T>(
  summary: string,
  items: T[],
  limit: number,
  renderTable: (items: T[]) => string,
): string | null {
  if (items.length === 0) return null;
  const shown = limit > 0 ? items.slice(0, limit) : items;
  const hidden =
    items.length > shown.length
      ? `\n\n_...and ${items.length - shown.length} more (use \`--limit\` to show more)._`
      : "";
  return `<details>\n<summary>${summary}</summary>\n\n${renderTable(shown)}${hidden}\n\n</details>`;
}

function formatMarkdown(
  comparison: Comparison,
  checks: Check[],
  { limit }: { limit: number },
): string {
  const { transformOptionsDiff, summary, modules, packages } = comparison;
  const sections = ["## 📦 Bundle size comparison"];

  if (transformOptionsDiff.length > 0) {
    const options = transformOptionsDiff
      .map(
        ({ option, before, after }) =>
          `\`${option}\`: \`${String(before)}\` → \`${String(after)}\``,
      )
      .join(", ");
    sections.push(
      `> [!WARNING]\n> Reports were built with different transform options (${options}), size comparison may be misleading.`,
    );
  }

  sections.push(
    mdTable(
      ["", "Before", "After", "Δ"],
      [
        [
          "**Platform**",
          formatPlatform(summary.before.platform),
          formatPlatform(summary.after.platform),
          summary.before.platform === summary.after.platform ? "" : "🔀",
        ],
        [
          "**Total size**",
          formatBytes(summary.before.sizeInBytes),
          formatBytes(summary.after.sizeInBytes),
          `${mdDeltaEmoji(summary.deltaInBytes)}${formatDelta(summary.deltaInBytes)} (${formatPercent(summary.deltaPercent)})`,
        ],
        [
          "**Modules**",
          summary.before.modules,
          summary.after.modules,
          formatCountDelta(summary.before.modules, summary.after.modules),
        ],
        [
          "**Packages**",
          summary.before.packages,
          summary.after.packages,
          formatCountDelta(summary.before.packages, summary.after.packages),
        ],
      ],
      [1, 2, 3],
    ),
  );

  if (checks.length > 0) {
    const failedChecks = checks.filter(({ passed }) => !passed);
    const lines = [
      failedChecks.length > 0
        ? "### ❌ Bundle checks failed"
        : "### ✅ Bundle checks passed",
      checks
        .map(({ passed, message }) => `- ${passed ? "✅" : "❌"} ${message}`)
        .join("\n"),
    ];
    if (shouldShowContributors(checks, comparison.biggestContributors)) {
      lines.push(
        "**Biggest contributors:**\n\n" +
          mdTable(
            ["Name", "Δ", "Note"],
            comparison.biggestContributors.map(
              ({ name, deltaInBytes, note }) => [
                mdCode(name),
                formatDelta(deltaInBytes),
                note ?? "",
              ],
            ),
            [1],
          ),
      );
    }
    if (failedChecks.length > 0) {
      lines.push(`_${getFixHint(failedChecks)}_`);
    }
    sections.push(lines.join("\n\n"));
  }

  const { deprecated } = packages;
  const packageSections = [
    mdDetails(
      `➕ Added packages (${packages.added.length})`,
      packages.added,
      limit,
      (items) =>
        mdTable(
          ["Package", "Version", "Size"],
          items.map((pkg) => [
            mdCode(pkg.name),
            formatVersions(pkg.versions),
            formatBytes(pkg.sizeInBytes),
          ]),
          [2],
        ),
    ),
    mdDetails(
      `➖ Removed packages (${packages.removed.length})`,
      packages.removed,
      limit,
      (items) =>
        mdTable(
          ["Package", "Version", "Size"],
          items.map((pkg) => [
            mdCode(pkg.name),
            formatVersions(pkg.versions),
            formatBytes(pkg.sizeInBytes),
          ]),
          [2],
        ),
    ),
    mdDetails(
      `🔄 Version changes (${packages.versionChanges.length})`,
      packages.versionChanges,
      limit,
      (items) =>
        mdTable(
          ["Package", "Before", "After", "Δ"],
          items.map((change) => [
            mdCode(change.name),
            formatVersions(change.beforeVersions),
            formatVersions(change.afterVersions),
            formatDelta(change.deltaInBytes),
          ]),
          [3],
        ),
    ),
    mdDetails(
      `👯 New duplicates (${packages.newDuplicates.length})`,
      packages.newDuplicates,
      limit,
      (items) =>
        mdTable(
          ["Package", "Copies", "Versions"],
          items.map((duplicate) => [
            mdCode(duplicate.name),
            duplicate.count,
            duplicate.entries
              .map((entry) => `${entry.name}@${entry.version} (${entry.path})`)
              .join("<br>"),
          ]),
        ),
    ),
  ].filter(Boolean);
  const deprecatedSection =
    deprecated.added.length > 0
      ? mdDetails(
          `⚠️ Deprecated packages: ${deprecated.beforeCount} → ${deprecated.afterCount} (${deprecated.added.length} new)`,
          deprecated.added,
          limit,
          (items) =>
            mdTable(
              ["Package", "Latest", "Reason"],
              items.map(({ id, latestVersion, reason }) => [
                mdCode(id),
                latestVersion ?? "",
                reason ?? "",
              ]),
            ),
        )
      : deprecated.beforeCount === 0 && deprecated.afterCount === 0
        ? null
        : `⚠️ Deprecated packages: ${deprecated.beforeCount} → ${deprecated.afterCount}`;
  sections.push(
    "### 📦 Packages",
    [
      packageSections.length > 0
        ? packageSections.join("\n\n")
        : "_No package changes._",
      deprecatedSection,
    ]
      .filter(Boolean)
      .join("\n\n"),
  );

  const moduleSections = [
    mdDetails(
      `🆕 Added modules (${modules.added.length}, ${formatDelta(sumBy(modules.added, "deltaInBytes"))})`,
      modules.added,
      limit,
      (items) =>
        mdTable(
          ["Module", "Size"],
          items.map((module) => [
            mdCode(module.path),
            formatBytes(module.sizeInBytes),
          ]),
          [1],
        ),
    ),
    mdDetails(
      `🗑️ Removed modules (${modules.removed.length}, ${formatDelta(sumBy(modules.removed, "deltaInBytes"))})`,
      modules.removed,
      limit,
      (items) =>
        mdTable(
          ["Module", "Size"],
          items.map((module) => [
            mdCode(module.path),
            formatBytes(module.sizeInBytes),
          ]),
          [1],
        ),
    ),
    mdDetails(
      `🔀 Changed modules (${modules.changed.length}, net ${formatDelta(sumBy(modules.changed, "deltaInBytes"))})`,
      modules.changed,
      limit,
      (items) =>
        mdTable(
          ["Module", "Before", "After", "Δ"],
          items.map((module) => [
            mdCode(module.path),
            formatBytes(module.beforeSizeInBytes),
            formatBytes(module.afterSizeInBytes),
            `${mdDeltaEmoji(module.deltaInBytes)}${formatDelta(module.deltaInBytes)}`,
          ]),
          [1, 2, 3],
        ),
    ),
  ].filter(Boolean);
  sections.push(
    "### 📄 Modules",
    moduleSections.length > 0
      ? moduleSections.join("\n\n")
      : "_No module changes._",
  );

  return `${sections.join("\n\n")}\n`;
}

// ---------- json format ----------

function limitList<T>(items: T[], limit: number) {
  return {
    count: items.length,
    items: limit > 0 ? items.slice(0, limit) : items,
  };
}

function printJsonFormat(
  comparison: Comparison,
  checks: Check[],
  { beforePath, afterPath, limit }: PrintOptions,
) {
  const { summary, modules, packages } = comparison;
  const output = {
    before: beforePath,
    after: afterPath,
    passed: checks.every(({ passed }) => passed),
    transformOptionsDiff: comparison.transformOptionsDiff,
    summary: {
      ...summary,
      delta: formatDelta(summary.deltaInBytes),
      deltaPercent:
        summary.deltaPercent === null
          ? null
          : Math.round(summary.deltaPercent * 100) / 100,
    },
    checks: checks.map(({ rule, passed, message }) => ({
      rule,
      passed,
      message,
    })),
    biggestContributors: comparison.biggestContributors,
    packages: {
      added: limitList(packages.added, limit),
      removed: limitList(packages.removed, limit),
      versionChanges: limitList(packages.versionChanges, limit),
      newDuplicates: limitList(packages.newDuplicates, limit),
      deprecated: packages.deprecated,
    },
    modules: {
      added: limitList(modules.added, limit),
      removed: limitList(modules.removed, limit),
      changed: limitList(modules.changed, limit),
    },
  };
  console.log(JSON.stringify(output, null, 2));
}

// ---------- GitHub Actions ----------

// https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions
function escapeAnnotation(value: unknown): string {
  return String(value)
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
}

function reportToGitHubActions(
  comparison: Comparison,
  checks: Check[],
  { limit, format }: { limit: number; format: CompareFormat },
) {
  if (process.env.GITHUB_ACTIONS !== "true") return;

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `${formatMarkdown(comparison, checks, { limit })}\n`,
    );
  }

  // Keep stdout clean when it is piped into a file (JSON, PR comment).
  const write = format === "default" ? console.log : console.error;
  comparison.transformOptionsDiff.forEach(({ option, before, after }) => {
    write(
      `::warning title=Bundle comparison::${escapeAnnotation(`Reports were built with different "${option}": ${String(before)} → ${String(after)}`)}`,
    );
  });
  checks
    .filter(({ passed }) => !passed)
    .forEach(({ rule, message }) => {
      write(
        `::error title=Bundle check (${rule})::${escapeAnnotation(message)}`,
      );
    });
}

export interface CompareReportOptions extends CheckOptions {
  format?: CompareFormat;
  limit?: number;
}

/**
 * @returns `true` when all CI checks passed
 */
export function printCompareReport(
  beforePath: string,
  afterPath: string,
  options: CompareReportOptions = {},
): boolean {
  const {
    format = "default",
    limit = 50,
    failOnIncrease,
    maxSize,
    failOn = [],
  } = options;
  const before = readBuildReport(beforePath, format);
  const after = readBuildReport(afterPath, format);

  const comparison = compareReports(before, after);
  const checks = runChecks(comparison, { failOnIncrease, maxSize, failOn });
  const printOptions = { beforePath, afterPath, limit };

  switch (format) {
    case "json":
      printJsonFormat(comparison, checks, printOptions);
      break;
    case "markdown":
      process.stdout.write(formatMarkdown(comparison, checks, printOptions));
      break;
    default:
      printDefaultFormat(comparison, checks, printOptions);
  }

  reportToGitHubActions(comparison, checks, { limit, format });

  return checks.every(({ passed }) => passed);
}
