const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { build } = require("@discoveryjs/cli");
const config = require("../.discoveryrc.js");

function buildHtmlPage(filePath, output, clean, singleFile, verbose) {
  if (verbose) {
    console.info(
      `Building HTML page from file: ${chalk.green(filePath)} options: ${JSON.stringify(
        { output, clean, singleFile },
        null,
        2,
      )}`,
    );
  }

  if (!filePath) {
    console.error(
      `Usage: '${chalk.green("npx react-native-bundle-discovery build <path-to-file>")}', Please provide a path to a JSON file.`,
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
    console.info(`Building HTML page with options:`, {
      output,
      clean,
      singleFile,
    });
  }

  const _config = {
    name: "Bundle Discovery",
    mode: "single",
    // models: [ [Object] ],
    colorScheme: "auto",
    download: true,
    upload: false,
    embed: false,
    encodings: false,
  };
  const _options = {
    singleFile,
    clean,
    output,
    //
    cache: true,
    cachedir: path.resolve(__dirname, "./.discoveryjs-cache"),
    checkCacheTtl: false,
    minify: true,
    dataCompression: true,
    sourcemap: false,
    embed: "by-config",
    experimentalJsonxl: false,
    scriptFormat: "esm",
    scriptExternal: [],
    data: true,
    excludeModelOnDataFail: false,
    prettyData: false,
    modelDownload: false,
    modelDataUpload: true,
    modelResetCache: false,
    serveOnlyAssets: true,
    dev: true,
    config: configFile,
    configFile: configFile,
  };
  build(_options, _config, configFile).then((result) => {
    console.log(`========================================`);
    console.log(
      `✅ HTML page built successfully at: ${chalk.green(
        path.resolve(output, "index.html").replace(process.cwd() + "/", ""),
      )}`,
    );
    console.log(`========================================`);
  });
}

module.exports = {
  buildHtmlPage,
};
