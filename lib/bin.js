#!/usr/bin/env node
const minimist = require("minimist");

function printHelp() {
  console.log(`react-native-bundle-discovery

Usage:
  react-native-bundle-discovery server <file> [port] [--verbose]
  react-native-bundle-discovery build <file> [--output <path>] [--clean] [--single-file] [--verbose]

Commands:
  server <file> [port]  Run a web server to show a Metro bundler stat report
  build <file>          Build a HTML report from the Metro bundler stat file

Options:
  -v, --verbose          Run with verbose logging
  -o, --output <path>    Path for a build result (default: .bundle-discovery)
  -c, --clean            Clean output directory before writing build files (default: true)
  -s, --single-file      Output report build as a single HTML file (default: true)
  -p, --port <port>      Port for server command (same as [port], default: 8079)
  -h, --help             Show help
`);
}

function fail(message) {
  console.error(message);
  console.error("Use --help to see usage.");
  process.exit(1);
}

const argv = minimist(process.argv.slice(2), {
  alias: {
    v: "verbose",
    h: "help",
    o: "output",
    c: "clean",
    s: "single-file",
    p: "port",
  },
  boolean: ["verbose", "help", "clean", "single-file"],
  string: ["output"],
  default: {
    clean: true,
    "single-file": true,
  },
});

const command = argv._[0];

if (argv.help || !command) {
  printHelp();
  process.exit(0);
}

if (command === "server") {
  const file = argv._[1];
  if (!file) {
    fail("Missing required argument: <file>");
  }

  const rawPort = argv.port ?? argv._[2] ?? 8079;
  const port = Number(rawPort);
  if (!Number.isFinite(port)) {
    fail(`Invalid port: ${rawPort}`);
  }

  const { serve } = require("./server.js");
  return serve(file, port, Boolean(argv.verbose));
}

if (command === "build") {
  const file = argv._[1];
  if (!file) {
    fail("Missing required argument: <file>");
  }

  const { buildHtmlPage } = require("./build.js");
  return buildHtmlPage(
    file,
    argv.output,
    argv.clean,
    argv["single-file"],
    Boolean(argv.verbose),
  );
}

fail(`Unknown command: ${command}`);
