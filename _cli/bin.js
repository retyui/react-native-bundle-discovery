#!/usr/bin/env node
const minimist = require("minimist");

function printHelp() {
  console.log(`react-native-bundle-discovery-cli

Usage:
  react-native-bundle-discovery-cli <file> [--format json|default] # <- analyze can be omitted
  react-native-bundle-discovery-cli analyze <file> [--format json|default]

  react-native-bundle-discovery-cli packages <file> [--sort size|name] [--format json|table|default]

Commands:
  packages <file>       Print package list from a Metro bundler stat report
  analyze <file>        Analyze bundle and print optimization recommendations
  analize <file>        Alias for \`analyze\`

Options:
  -h, --help            Show help
  --sort                Sort by size (default, desc) or name (asc)
  --format              Output format (packages: json|table|default; analyze: json|default)
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
const isPackagesCommand = command === "packages";
const isAnalyzeCommand = command === "analyze" || command === "analize";
const isImplicitAnalyzeCommand =
  Boolean(command) && !isPackagesCommand && !isAnalyzeCommand;

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
