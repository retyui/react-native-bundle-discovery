const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { createServer } = require("@discoveryjs/cli");
const config = require("../.discoveryrc.js");

function serve(filePath, port, verbose) {
  const PORT = process.env.PORT || port;

  if (verbose) {
    console.info(
      `start server with file: ${filePath} on port: ${port} ${process.env.PORT ? `(${chalk.yellow("PORT")} env)` : ""}`,
    );
  }

  if (!filePath) {
    console.error(
      `Usage: '${chalk.green("npx react-native-bundle-discovery server <path-to-file>")}', Please provide a path to a JSON file.`,
    );
    process.exit(1);
  }

  const jsonFilePath = path.resolve(process.cwd(), filePath);
  if (verbose) {
    console.info(
      `Loading JSON file from: ${chalk.green(jsonFilePath)}, base directory: ${chalk.green(process.cwd())}`,
    );
  }

  let fullJsonPath;

  try {
    fullJsonPath = require.resolve(jsonFilePath);
  } catch (err) {
    console.error(`❌Error loading file: ${chalk.red(jsonFilePath)}\n\n`);
    console.error(err.message);
    process.exit(1);
  }

  const configFile = path.resolve(__dirname, "./.tmp.js");

  if (verbose) {
    console.info(
      `Creating temporary config file at: ${chalk.green(configFile)}, for discovery.js`,
    );
  }
  fs.writeFileSync(
    configFile,
    `module.exports = ${JSON.stringify(
      { ...config, data: "<tmp>" },
      null,
      1,
    ).replace(`"<tmp>"`, `() => require("${fullJsonPath}")`)};`,
  );

  if (verbose) {
    console.info(`Running server with config: ${chalk.green(configFile)}`);
  }

  createServer({
    cache: false,
    minify: true,
    dev: false,
    config: configFile,
    configFile,
  }).then((server) =>
    server.listen(PORT, () => {
      console.log(`========================================`);
      console.log(
        `🚀 Server listen on ${chalk.green.underline(
          chalk.green(`http://localhost:${PORT}`),
        )}`,
      );
      console.log(`========================================`);
    }),
  );
}

module.exports = {
  serve,
};
