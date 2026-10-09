#!/usr/bin/env node
import Module from "node:module";
import path from "node:path";
import minimist from "minimist";
import { buildHtmlPage } from "./build";
import { serve } from "./server";

function printHelp() {
  console.log(`react-native-bundle-discovery-ui

Usage:
  react-native-bundle-discovery-ui <file> [port] [--compare <file>] [--verbose] # <- server can be omitted
  react-native-bundle-discovery-ui server <file> [port] [--compare <file>] [--verbose]

  react-native-bundle-discovery-ui build <file> [--compare <file>] [--output <path>] [--clean] [--single-file] [--verbose]

Commands:
  server <file> [port]  Run a web server to show a Metro bundler stat report
  build <file>          Build a HTML report from the Metro bundler stat file

Options:
  -v, --verbose          Run with verbose logging
  -o, --output <path>    Path for a build result (default: .bundle-discovery)
  -c, --clean            Clean output directory before writing build files (default: true)
  -s, --single-file      Output report build as a single HTML file (default: true)
  -p, --port <port>      Port for server command (same as [port], default: 8079)
  --compare <file>       A "before" report to compare <file> with (adds the Compare tab)
  -h, --help             Show help
`);
}

function fail(message: string): never {
  console.error(message);
  console.error("Use --help to see usage.");
  process.exit(1);
}

// `@discoveryjs/cli` resolves `@discoveryjs/discovery` from `process.cwd()`,
// which fails when run via `npx` outside a project that has it installed.
// Expose our own node_modules as a global lookup path so it can be found.
function exposeDiscoveryToCli() {
  const nodeModulesDir = path.resolve(
    require.resolve("@discoveryjs/discovery/package.json"),
    "../../..",
  );
  process.env.NODE_PATH = [nodeModulesDir, process.env.NODE_PATH]
    .filter(Boolean)
    .join(path.delimiter);
  (Module as unknown as { _initPaths(): void })._initPaths();
}

function main() {
  exposeDiscoveryToCli();

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
    string: ["output", "compare"],
    default: {
      clean: true,
      "single-file": true,
    },
  });

  const command = argv._[0];
  const isServerCommand = command === "server";
  const isBuildCommand = command === "build";
  const isImplicitServerCommand =
    Boolean(command) && !isServerCommand && !isBuildCommand;

  if (argv.help || !command) {
    printHelp();
    process.exit(0);
  }

  if (isServerCommand || isImplicitServerCommand) {
    const file = isImplicitServerCommand ? argv._[0] : argv._[1];
    if (!file) {
      fail("Missing required argument: <file>");
    }

    const rawPort =
      argv.port ?? (isImplicitServerCommand ? argv._[1] : argv._[2]) ?? 8079;
    const port = Number(rawPort);
    if (!Number.isFinite(port)) {
      fail(`Invalid port: ${rawPort}`);
    }

    return serve(file, port, Boolean(argv.verbose), argv.compare);
  }

  if (isBuildCommand) {
    const file = argv._[1];
    if (!file) {
      fail("Missing required argument: <file>");
    }

    return buildHtmlPage(
      file,
      argv.output,
      argv.clean,
      argv["single-file"],
      Boolean(argv.verbose),
      argv.compare,
    );
  }

  fail(`Unknown command: ${command}`);
}

main();
