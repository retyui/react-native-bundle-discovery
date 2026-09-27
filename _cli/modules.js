const chalk = require("chalk");
const { readBuildReport } = require("./readReport.js");
const { formatBytes } = require("./utils.js");

// "/pattern/flags" -> RegExp, anything else -> case-insensitive substring match.
function createModuleMatcher(filter) {
  if (filter === undefined || filter === null || filter === "") {
    return () => true;
  }

  const value = String(filter);
  const regexpMatch = value.match(/^\/(.+)\/([a-z]*)$/);
  if (regexpMatch) {
    let regexp;
    try {
      regexp = new RegExp(regexpMatch[1], regexpMatch[2]);
    } catch (error) {
      throw new Error(`Invalid regular expression for --filter: ${value}`);
    }
    return (modulePath) => {
      // Reset state for global/sticky regexps.
      regexp.lastIndex = 0;
      return regexp.test(modulePath);
    };
  }

  const needle = value.toLowerCase();
  return (modulePath) => modulePath.toLowerCase().includes(needle);
}

function getModules(report, { sort = "size", filter } = {}) {
  const matches = createModuleMatcher(filter);
  const rootPrefix = report.rootFolder ? `${report.rootFolder}/` : null;

  const modules = report.modules
    .map((module) => {
      const absolutePath = module?.path ?? "<unknown>";
      const modulePath =
        rootPrefix && absolutePath.startsWith(rootPrefix)
          ? absolutePath.slice(rootPrefix.length)
          : absolutePath;
      return {
        path: modulePath,
        sizeInBytes: module?.output?.sizeInBytes ?? 0,
        sourceSizeInBytes: module?.source?.sizeInBytes ?? 0,
      };
    })
    .filter((module) => matches(module.path));

  if (sort === "name") {
    modules.sort((a, b) => a.path.localeCompare(b.path));
  } else {
    // Default behavior: show heavier modules first.
    modules.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
  }

  return modules;
}

function getSummary(report, modules, shownModules) {
  return {
    totalModules: report.modules.length,
    matchedModules: modules.length,
    shownModules: shownModules.length,
    matchedSizeInBytes: modules.reduce((sum, m) => sum + m.sizeInBytes, 0),
  };
}

function printDefaultFormat(summary, shownModules, { filter }) {
  const filterLabel = filter ? ` matching ${chalk.yellow(filter)}` : "";
  console.log(
    chalk.bold.cyan(
      `Found ${summary.matchedModules} of ${summary.totalModules} modules`,
    ) +
      filterLabel +
      chalk.bold.cyan(` - ${formatBytes(summary.matchedSizeInBytes)}`),
  );

  shownModules.forEach((module, index) => {
    const listIndex = chalk.dim(`${index + 1}.`);
    console.log(
      `${listIndex} ${chalk.whiteBright(module.path)} - ${chalk.magenta(formatBytes(module.sizeInBytes))}`,
    );
  });

  printHiddenNote(summary);
}

function printTableFormat(summary, shownModules, { filter }) {
  const filterLabel = filter ? ` matching ${filter}` : "";
  console.log(
    `Found ${summary.matchedModules} of ${summary.totalModules} modules${filterLabel} - ${formatBytes(summary.matchedSizeInBytes)}`,
  );
  console.log("");

  const rows = shownModules.map((module, index) => ({
    "#": index + 1,
    Module: module.path,
    Size: formatBytes(module.sizeInBytes),
  }));

  if (rows.length > 0) {
    const keys = Object.keys(rows[0]);
    const colWidths = {};
    keys.forEach((key) => {
      colWidths[key] = Math.max(
        key.length,
        ...rows.map((row) => String(row[key]).length),
      );
    });

    console.log(keys.map((key) => key.padEnd(colWidths[key])).join(" | "));
    console.log(keys.map((key) => "-".repeat(colWidths[key])).join("-+-"));
    rows.forEach((row) => {
      console.log(
        keys.map((key) => String(row[key]).padEnd(colWidths[key])).join(" | "),
      );
    });
  }

  printHiddenNote(summary);
}

function printHiddenNote(summary) {
  const hidden = summary.matchedModules - summary.shownModules;
  if (hidden > 0) {
    console.log(
      chalk.dim(
        `\n... and ${hidden} more. Use --limit <n> to show more (--limit 0 shows all).`,
      ),
    );
  }
}

function printJsonFormat(summary, shownModules) {
  const output = {
    summary: {
      ...summary,
      matchedSize: formatBytes(summary.matchedSizeInBytes),
    },
    modules: shownModules.map((module, index) => ({
      index: index + 1,
      path: module.path,
      sizeInBytes: module.sizeInBytes,
      size: formatBytes(module.sizeInBytes),
      sourceSizeInBytes: module.sourceSizeInBytes,
    })),
  };

  console.log(JSON.stringify(output, null, 2));
}

function printModulesList(filePath, options = {}) {
  const { sort = "size", format = "default", limit = 50, filter } = options;
  const report = readBuildReport(filePath, format);

  const modules = getModules(report, { sort, filter });
  const shownModules = limit > 0 ? modules.slice(0, limit) : modules;
  const summary = getSummary(report, modules, shownModules);

  switch (format) {
    case "json":
      printJsonFormat(summary, shownModules);
      break;
    case "table":
      printTableFormat(summary, shownModules, { filter });
      break;
    default:
      printDefaultFormat(summary, shownModules, { filter });
  }
}

module.exports = {
  printModulesList,
  getModules,
  createModuleMatcher,
};
