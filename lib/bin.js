#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { createServer } = require("@discoveryjs/cli");
const config = require("../.discoveryrc.js");

const filePath = process.argv[2];

if (!filePath) {
  console.error(
    `Usage: '${chalk.green("npx react-native-bundle-discovery <path-to-file>")}', Please provide a path to a JSON file.`,
  );
  process.exit(1);
}

const jsonFilePath = path.resolve(process.cwd(), filePath);

let fullJsonPath;

try {
  fullJsonPath = require.resolve(jsonFilePath);
} catch (err) {
  console.error(`Error loading file: ${chalk.red(jsonFilePath)}`);
  console.error(err.message);
  process.exit(1);
}

const PORT = process.env.PORT || 8079;

const configFile = path.resolve(__dirname, "./.tmp.js");

fs.writeFileSync(
  configFile,
  `module.exports = ${JSON.stringify(
    { ...config, data: "<tmp>" },
    null,
    1,
  ).replace(`"<tmp>"`, `() => require("${fullJsonPath}")`)};`,
);

createServer({
  cache: false,
  minify: true,
  dev: false,
  config: configFile,
  configFile,
}).then((server) =>
  server.listen(PORT, () =>
    console.log(`Server listen on ${chalk.green(`http://localhost:${PORT}`)}`),
  ),
);
