#!/usr/bin/env node
const minimist = require("minimist");

function printHelp() {
  console.log(`react-native-bundle-discovery-cli

Usage:
  react-native-bundle-discovery-cli <file> [--format json|default] # <- analyze can be omitted
  react-native-bundle-discovery-cli analyze <file> [--format json|default]

  react-native-bundle-discovery-cli packages <file> [--sort size|name] [--format json|table|default]

  react-native-bundle-discovery-cli modules <file> [--limit 50] [--filter <text|/regexp/>] [--sort size|name] [--format json|table|default]

  react-native-bundle-discovery-cli compare --before <file> --after <file> [--limit 50] [--format json|markdown|default]
      [--fail-on-increase <size|%>] [--max-size <size>] [--fail-on new-duplicates,new-deprecated]

Commands:
  packages <file>       Print package list from a bundler stat report
  modules <file>        Print module list (heaviest first) from a bundler stat report
  compare               Compare two bundler stat reports (sizes, modules, packages)
  analyze <file>        Analyze bundle and print optimization recommendations
  analize <file>        Alias for \`analyze\`

Options:
  -h, --help            Show help
  --sort                Sort by size (default, desc) or name (asc)
  --format              Output format (packages/modules: json|table|default; analyze: json|default; compare: json|markdown|default)
  --limit               Max number of items to print per list (modules/compare, default: 50, 0 = all)
  --filter              Filter modules by path: plain text (case-insensitive) or /regexp/

Compare options:
  --before <file>       Base report (e.g. from the main branch)
  --after <file>        New report (e.g. from a pull request)
  --fail-on-increase    Exit with code 1 if the bundle grows more than the limit: 50KB, 0.5MB, 51200, 5%
  --max-size            Exit with code 1 if the "after" bundle is bigger than the limit: 3MB
  --fail-on             Exit with code 1 on: new-duplicates, new-deprecated (comma separated)

  On GitHub Actions the markdown report is added to the job summary automatically.
`);
}

function fail(message) {
  console.error(message);
  console.error("Use --help to see usage.");
  process.exit(1);
}

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: "help",
  },
  boolean: ["help"],
  string: [
    "filter",
    "before",
    "after",
    "fail-on-increase",
    "max-size",
    "fail-on",
  ],
  default: {
    sort: "size",
    format: "default",
  },
});

const command = argv._[0];
const isPackagesCommand = command === "packages";
const isModulesCommand = command === "modules";
const isCompareCommand = command === "compare";
const isAnalyzeCommand = command === "analyze" || command === "analize";
const isImplicitAnalyzeCommand =
  Boolean(command) &&
  !isPackagesCommand &&
  !isModulesCommand &&
  !isCompareCommand &&
  !isAnalyzeCommand;

if (argv.help || !command) {
  printHelp();
  process.exit(0);
}

if (isPackagesCommand) {
  const file = argv._[1];
  const sort = argv.sort;
  const format = argv.format;
  if (!file) {
    fail("Missing required argument: <file>");
  }
  if (sort !== "size" && sort !== "name") {
    fail(`Invalid value for --sort: ${sort}. Expected one of: size, name.`);
  }
  if (format !== "json" && format !== "table" && format !== "default") {
    fail(
      `Invalid value for --format: ${format}. Expected one of: json, table, default.`,
    );
  }

  try {
    const { printPackagesList } = require("./packages.js");
    return printPackagesList(file, { sort, format });
  } catch (error) {
    fail(error.message);
  }
}

if (isModulesCommand) {
  const file = argv._[1];
  const sort = argv.sort;
  const format = argv.format;
  const filter = argv.filter;
  const limit = argv.limit === undefined ? 50 : Number(argv.limit);
  if (!file) {
    fail("Missing required argument: <file>");
  }
  if (sort !== "size" && sort !== "name") {
    fail(`Invalid value for --sort: ${sort}. Expected one of: size, name.`);
  }
  if (format !== "json" && format !== "table" && format !== "default") {
    fail(
      `Invalid value for --format: ${format}. Expected one of: json, table, default.`,
    );
  }
  if (!Number.isInteger(limit) || limit < 0) {
    fail(
      `Invalid value for --limit: ${argv.limit}. Expected a non-negative integer.`,
    );
  }

  try {
    const { printModulesList } = require("./modules.js");
    return printModulesList(file, { sort, format, limit, filter });
  } catch (error) {
    fail(error.message);
  }
}

if (isCompareCommand) {
  const { before, after, format } = argv;
  const limit = argv.limit === undefined ? 50 : Number(argv.limit);
  if (!before || !after) {
    fail(
      "Missing required arguments: --before <file> --after <file>\nExample: compare --before main-stats.json --after pr-stats.json",
    );
  }
  if (format !== "json" && format !== "markdown" && format !== "default") {
    fail(
      `Invalid value for --format: ${format}. Expected one of: json, markdown, default.`,
    );
  }
  if (!Number.isInteger(limit) || limit < 0) {
    fail(
      `Invalid value for --limit: ${argv.limit}. Expected a non-negative integer.`,
    );
  }

  const { parseSizeLimit } = require("./utils.js");
  let failOnIncrease;
  if (argv["fail-on-increase"] !== undefined) {
    failOnIncrease = parseSizeLimit(argv["fail-on-increase"], {
      allowPercent: true,
    });
    if (!failOnIncrease) {
      fail(
        `Invalid value for --fail-on-increase: "${argv["fail-on-increase"]}". Examples: 50KB, 0.5MB, 51200, 5%`,
      );
    }
  }
  let maxSize;
  if (argv["max-size"] !== undefined) {
    maxSize = parseSizeLimit(argv["max-size"]);
    if (!maxSize) {
      fail(
        `Invalid value for --max-size: "${argv["max-size"]}". Examples: 3MB, 2500KB, 3145728`,
      );
    }
  }

  const { printCompareReport, FAIL_ON_RULES } = require("./compare.js");
  const failOn =
    argv["fail-on"] === undefined
      ? []
      : String(argv["fail-on"])
          .split(",")
          .map((rule) => rule.trim())
          .filter(Boolean);
  const unknownRules = failOn.filter((rule) => !FAIL_ON_RULES.includes(rule));
  if (unknownRules.length > 0) {
    fail(
      `Invalid value for --fail-on: ${unknownRules.join(", ")}. Expected one of: ${FAIL_ON_RULES.join(", ")}.`,
    );
  }

  try {
    const passed = printCompareReport(before, after, {
      format,
      limit,
      failOnIncrease,
      maxSize,
      failOn,
    });
    if (!passed) {
      process.exitCode = 1;
    }
    return;
  } catch (error) {
    fail(error.message);
  }
}

if (isAnalyzeCommand || isImplicitAnalyzeCommand) {
  const file = isImplicitAnalyzeCommand ? argv._[0] : argv._[1];
  const format = argv.format;
  if (!file) {
    fail("Missing required argument: <file>");
  }
  if (format !== "json" && format !== "default") {
    fail(
      `Invalid value for --format: ${format}. Expected one of: json, default.`,
    );
  }

  try {
    const { printAnalyzeReport } = require("./analyze.js");
    return printAnalyzeReport(file, { format });
  } catch (error) {
    fail(error.message);
  }
}

fail(`Unknown command: ${command}`);
