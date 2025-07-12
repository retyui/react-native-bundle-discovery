#!/usr/bin/env node
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
  .command(
    "server <file> [port]",
    "🚀 Run a web server to show a Metro bundler stat report",
    (yargs) => {
      return yargs
        .positional("file", {
          describe: "Path to the Metro bundler report json file",
          type: "string",
          demandOption: true,
        })
        .positional("port", {
          describe:
            "🔌 Port to start the server on (also can be set with PORT env. var.)",
          type: "number",
          default: 8079,
        });
    },
    (argv) => {
      const { serve } = require("./server.js");
      serve(argv.file, argv.port, argv.verbose);
    },
  )
  .command(
    "build <file>",
    "📦 Build a HTML report from the Metro bundler stat file",
    (yargs) => {
      return yargs
        .positional("file", {
          describe: "Path to the Metro bundler report json file",
          type: "string",
          demandOption: true,
        })
        .option("output", {
          alias: "o",
          describe: "Path for a build result",
          type: "string",
          default: ".bundle-discovery",
        })
        .option("clean", {
          alias: "c",
          describe: "Clean the output directory before emit a build files",
          type: "boolean",
          default: true,
        })
        .option("single-file", {
          alias: "s",
          describe: "Output a report build as a single HTML file",
          type: "boolean",
          default: true,
        });
    },
    (argv) => {
      const { buildHtmlPage } = require("./build.js");
      buildHtmlPage(
        argv.file,
        argv.output,
        argv.clean,
        argv.singleFile,
        argv.verbose,
      );
    },
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .help()
  .parse();
