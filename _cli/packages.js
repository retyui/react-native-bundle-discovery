const path = require("path");
const { prepareReport } = require("./prepare.js");
const { formatBytes } = require("./utils.js");

function readBuildReport(filePath) {
  try {
    // Resolve from current working directory to support relative CLI paths.
    const resolvedPath = path.resolve(filePath);
    const report = require(resolvedPath);

    return prepareReport(report);
  } catch (error) {
    throw new Error(`Failed to read report file: ${filePath}\n${error.message}`);
  }
}

function getPackageGroups(report, sort = "size") {
  const groupedPackages = report.packages.reduce((map, pkg) => {
    const name = pkg?.name ?? "<unknown>";
    const version = pkg?.version ?? "<unknown>";
    const packagePath = pkg?.path ?? pkg?.absolutePath ?? "<unknown>";
    const sizeInBytes = pkg?.sizeInBytes ?? 0;

    if (!map.has(name)) {
      map.set(name, []);
    }

    map.get(name).push({ version, path: packagePath, sizeInBytes });
    return map;
  }, new Map());

  const packageGroups = Array.from(groupedPackages.entries()).map(([name, entries]) => {
    const totalSizeInBytes = entries.reduce((sum, entry) => sum + entry.sizeInBytes, 0);
    return { name, entries, totalSizeInBytes };
  });

  if (sort === "name") {
    packageGroups.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default behavior: show heavier packages first.
    packageGroups.sort((a, b) => b.totalSizeInBytes - a.totalSizeInBytes);
  }

  return packageGroups;
}

function printDefaultFormat(packageGroups, report) {
  const duplicateCount = packageGroups.filter(({ entries }) => entries.length > 1).length;

  console.log(
    `Found ${report.packages.length} package entries (${packageGroups.length} unique names)`,
  );
  console.log(`Duplicate package names: ${duplicateCount}`);

  packageGroups.forEach(({ name, entries }, index) => {
    if (entries.length === 1) {
      const entry = entries[0];
      console.log(
        `${index + 1}. ${name}@${entry.version} (${entry.path}) - ${formatBytes(entry.sizeInBytes)}`,
      );
      return;
    }

    console.log(`${index + 1}. ${name} [DUPLICATE x${entries.length}]`);
    entries.forEach((entry, entryIndex) => {
      console.log(
        `   - ${entryIndex + 1}) ${entry.version} (${entry.path}) - ${formatBytes(entry.sizeInBytes)}`,
      );
    });
  });
}

function printTableFormat(packageGroups, report) {
  const duplicateCount = packageGroups.filter(({ entries }) => entries.length > 1).length;

  console.log(
    `Found ${report.packages.length} package entries (${packageGroups.length} unique names)`,
  );
  console.log(`Duplicate package names: ${duplicateCount}`);
  console.log("");

  const rows = [];
  packageGroups.forEach(({ name, entries }, index) => {
    if (entries.length === 1) {
      const entry = entries[0];
      rows.push({
        "#": index + 1,
        "Package": `${name}@${entry.version}`,
        "Path": entry.path,
        "Size": formatBytes(entry.sizeInBytes),
      });
    } else {
      rows.push({
        "#": index + 1,
        "Package": `${name} [DUPLICATE x${entries.length}]`,
        "Path": "",
        "Size": "",
      });
      entries.forEach((entry, entryIndex) => {
        rows.push({
          "#": "",
          "Package": `  ${entryIndex + 1}) ${entry.version}`,
          "Path": entry.path,
          "Size": formatBytes(entry.sizeInBytes),
        });
      });
    }
  });

  // Print table
  if (rows.length > 0) {
    const keys = Object.keys(rows[0]);
    const colWidths = {};
    keys.forEach(key => {
      colWidths[key] = Math.max(
        key.length,
        ...rows.map(row => String(row[key]).length),
      );
    });

    // Print header
    console.log(
      keys.map(key => key.padEnd(colWidths[key])).join(" | "),
    );
    console.log(
      keys.map(key => "-".repeat(colWidths[key])).join("-+-"),
    );

    // Print rows
    rows.forEach(row => {
      console.log(
        keys.map(key => String(row[key]).padEnd(colWidths[key])).join(" | "),
      );
    });
  }
}

function printJsonFormat(packageGroups, report) {
  const duplicateCount = packageGroups.filter(({ entries }) => entries.length > 1).length;

  const output = {
    summary: {
      totalPackageEntries: report.packages.length,
      uniquePackageNames: packageGroups.length,
      duplicatePackages: duplicateCount,
    },
    packages: packageGroups.map(({ name, entries, totalSizeInBytes }, index) => {
      if (entries.length === 1) {
        const entry = entries[0];
        return {
          index: index + 1,
          name,
          isDuplicate: false,
          entries: [
            {
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
            version: entry.version,
            path: entry.path,
            sizeInBytes: entry.sizeInBytes,
            size: formatBytes(entry.sizeInBytes),
          })),
          totalSizeInBytes,
          totalSize: formatBytes(totalSizeInBytes),
        };
      }
    }),
  };

  console.log(JSON.stringify(output, null, 2));
}

function printPackagesList(filePath, options = {}) {
  const { sort = "size", format = "default" } = options;
  const report = readBuildReport(filePath);

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

module.exports = {
  printPackagesList,
};
