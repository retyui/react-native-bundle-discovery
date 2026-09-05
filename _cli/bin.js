#!/usr/bin/env node
const minimist = require("minimist");

function printHelp() {
  console.log(`react-native-bundle-discovery-cli

Usage:
  react-native-bundle-discovery-cli packages <file> [--sort size|name] [--format json|table|default]
  react-native-bundle-discovery-cli analyze <file> [--format json|default]

Commands:
  packages <file>       Print package list from a Metro bundler stat report
  analyze <file>        Analyze bundle and print optimization recommendations

Options:
  -h, --help             Show help
  --sort                 Sort by size (default, desc) or name (asc)
  --format               Output format: json, table, or default (default: default)
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
  default: {
    sort: "size",
    format: "default",
  },
});

const command = argv._[0];

if (argv.help || !command) {
  printHelp();
  process.exit(0);
}

if (command === "packages") {
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

if (command === "analyze" || command === "analize") {
  const file = argv._[1];
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
