import type { PreparedReport } from "./prepareReport";

export type SortOrder = "size" | "name";

export interface PackageEntry {
  name: string;
  version: string;
  path: string;
  absolutePath: string;
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
      absolutePath: pkg?.absolutePath ?? packagePath,
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
