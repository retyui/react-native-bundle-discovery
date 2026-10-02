import chalk from "chalk";
import { readBuildReport } from "./readReport";
import type { PreparedReport, SortOrder } from "./types";
import { formatBytes } from "./utils";

export type PackagesFormat = "json" | "table" | "default";

export interface PackageEntry {
  name: string;
  version: string;
  path: string;
  sizeInBytes: number;
}

export interface PackageGroup {
  name: string;
  entries: PackageEntry[];
  totalSizeInBytes: number;
}

export const LODASH_FAMILY_GROUP = "lodash (please use only one)";

export function getDuplicateGroupName(packageName: string): string {
  if (
    packageName === "lodash" ||
    packageName === "lodash-es" ||
    packageName === "underscore" ||
    packageName === "ramda" ||
    packageName.startsWith("lodash.")
  ) {
    return LODASH_FAMILY_GROUP;
  }

  return packageName;
}

export function getPackageGroups(
  report: PreparedReport,
  sort: SortOrder = "size",
): PackageGroup[] {
  const groupedPackages = report.packages.reduce((map, pkg) => {
    const name = pkg?.name ?? "<unknown>";
    const duplicateGroupName = getDuplicateGroupName(name);
    const version = pkg?.version ?? "<unknown>";
    const packagePath = pkg?.path ?? pkg?.absolutePath ?? "<unknown>";
    const sizeInBytes = pkg?.sizeInBytes ?? 0;

    let entries = map.get(duplicateGroupName);
    if (!entries) {
      entries = [];
      map.set(duplicateGroupName, entries);
    }

    entries.push({
      name,
      version,
      path: packagePath,
      sizeInBytes,
    });
    return map;
  }, new Map<string, PackageEntry[]>());

  const packageGroups = Array.from(groupedPackages.entries()).map(
    ([name, entries]) => {
      const totalSizeInBytes = entries.reduce(
        (sum, entry) => sum + entry.sizeInBytes,
        0,
      );
      return { name, entries, totalSizeInBytes };
    },
  );

  if (sort === "name") {
    packageGroups.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default behavior: show heavier packages first.
    packageGroups.sort((a, b) => b.totalSizeInBytes - a.totalSizeInBytes);
  }

  return packageGroups;
}

function printDefaultFormat(
  packageGroups: PackageGroup[],
  report: PreparedReport,
) {
  const duplicateCount = packageGroups.filter(
    ({ entries }) => entries.length > 1,
  ).length;

  console.log(
    chalk.bold.cyan(
      `Found ${report.packages.length} package entries (${packageGroups.length} unique names)`,
    ),
  );

  if (duplicateCount > 0) {
    console.log(
      chalk.bold.yellow(`Duplicate package names: ${duplicateCount}`),
    );
  } else {
    console.log(chalk.bold.green("Duplicate package names: 0"));
  }

  packageGroups.forEach(({ name, entries }, index) => {
    const listIndex = chalk.dim(`${index + 1}.`);

    if (entries.length === 1) {
      const entry = entries[0];
      console.log(
        `${listIndex} ${chalk.whiteBright(`${entry.name}@${entry.version}`)} ${chalk.gray(`(${entry.path})`)} - ${chalk.magenta(formatBytes(entry.sizeInBytes))}`,
      );
      return;
    }

    console.log(
      `${listIndex} ${chalk.yellowBright(name)} ${chalk.black.bgYellow(` DUPLICATE x${entries.length} `)}`,
    );
    entries.forEach((entry, entryIndex) => {
      console.log(
        `   ${chalk.gray(`- ${entryIndex + 1})`)} ${chalk.white(`${entry.name}@${entry.version}`)} ${chalk.gray(`(${entry.path})`)} - ${chalk.magenta(formatBytes(entry.sizeInBytes))}`,
      );
    });
  });
}

interface TableRow {
  "#": number | "";
  Package: string;
  Path: string;
  Size: string;
}

function printTableFormat(
  packageGroups: PackageGroup[],
  report: PreparedReport,
) {
  const duplicateCount = packageGroups.filter(
    ({ entries }) => entries.length > 1,
  ).length;

  console.log(
    `Found ${report.packages.length} package entries (${packageGroups.length} unique names)`,
  );
  console.log(`Duplicate package names: ${duplicateCount}`);
  console.log("");

  const rows: TableRow[] = [];
  packageGroups.forEach(({ name, entries }, index) => {
    if (entries.length === 1) {
      const entry = entries[0];
      rows.push({
        "#": index + 1,
        Package: `${entry.name}@${entry.version}`,
        Path: entry.path,
        Size: formatBytes(entry.sizeInBytes),
      });
    } else {
      rows.push({
        "#": index + 1,
        Package: `${name} [DUPLICATE x${entries.length}]`,
        Path: "",
        Size: "",
      });
      entries.forEach((entry, entryIndex) => {
        rows.push({
          "#": "",
          Package: `  ${entryIndex + 1}) ${entry.name}@${entry.version}`,
          Path: entry.path,
          Size: formatBytes(entry.sizeInBytes),
        });
      });
    }
  });

  // Print table
  if (rows.length > 0) {
    const keys = Object.keys(rows[0]) as (keyof TableRow)[];
    const colWidths = {} as Record<keyof TableRow, number>;
    keys.forEach((key) => {
      colWidths[key] = Math.max(
        key.length,
        ...rows.map((row) => String(row[key]).length),
      );
    });

    // Print header
    console.log(keys.map((key) => key.padEnd(colWidths[key])).join(" | "));
    console.log(keys.map((key) => "-".repeat(colWidths[key])).join("-+-"));

    // Print rows
    rows.forEach((row) => {
      console.log(
        keys.map((key) => String(row[key]).padEnd(colWidths[key])).join(" | "),
      );
    });
  }
}

function printJsonFormat(
  packageGroups: PackageGroup[],
  report: PreparedReport,
) {
  const duplicateCount = packageGroups.filter(
    ({ entries }) => entries.length > 1,
  ).length;

  const output = {
    summary: {
      totalPackageEntries: report.packages.length,
      uniquePackageNames: packageGroups.length,
      duplicatePackages: duplicateCount,
    },
    packages: packageGroups.map(
      ({ name, entries, totalSizeInBytes }, index) => {
        if (entries.length === 1) {
          const entry = entries[0];
          return {
            index: index + 1,
            name: entry.name,
            isDuplicate: false,
            entries: [
              {
                name: entry.name,
                version: entry.version,
                path: entry.path,
                sizeInBytes: entry.sizeInBytes,
                size: formatBytes(entry.sizeInBytes),
              },
            ],
            totalSizeInBytes,
            totalSize: formatBytes(totalSizeInBytes),
          };
        } else {
          return {
            index: index + 1,
            name,
            isDuplicate: true,
            duplicateCount: entries.length,
            entries: entries.map((entry, entryIndex) => ({
              index: entryIndex + 1,
              name: entry.name,
              version: entry.version,
              path: entry.path,
              sizeInBytes: entry.sizeInBytes,
              size: formatBytes(entry.sizeInBytes),
            })),
            totalSizeInBytes,
            totalSize: formatBytes(totalSizeInBytes),
          };
        }
      },
    ),
  };

  console.log(JSON.stringify(output, null, 2));
}

export interface PackagesListOptions {
  sort?: SortOrder;
  format?: PackagesFormat;
}

export function printPackagesList(
  filePath: string,
  options: PackagesListOptions = {},
): void {
  const { sort = "size", format = "default" } = options;
  const report = readBuildReport(filePath, format);

  if (report.packages.length === 0) {
    if (format === "json") {
      console.log(JSON.stringify({ message: "No packages found in report" }));
    } else {
      console.log("No packages found in report");
    }
    return;
  }

  const packageGroups = getPackageGroups(report, sort);

  switch (format) {
    case "json":
      printJsonFormat(packageGroups, report);
      break;
    case "table":
      printTableFormat(packageGroups, report);
      break;
    default:
      printDefaultFormat(packageGroups, report);
  }
}
