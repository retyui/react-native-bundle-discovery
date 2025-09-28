import fs from "fs";
import path from "path";
import { createSerializer } from "react-native-bundle-discovery";
import { createServer } from "@discoveryjs/cli";
import discoveryrc from "react-native-bundle-discovery/.discoveryrc.js";

const id = Math.floor(Math.random() * 10);
const fileName = `rozenite-metro-stats-${id}.json`; // Random name in case if multiple instances of Metro are running on different ports
const defaultOutputJsonPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../.stats",
  fileName,
);

try {
  fs.unlinkSync(defaultOutputJsonPath);
} catch (e) {
  // Ignore if file does not exist
}

let outputJsonPath = defaultOutputJsonPath;

function injectBundleDiscovery(config, options) {
  const hasSerializer = Boolean(
    config && config.serializer && config.serializer.customSerializer,
  );

  outputJsonPath = (options && options.outputJsonPath) || defaultOutputJsonPath;

  const newSerializer = createSerializer({
    projectRoot: process.cwd(),
    silent: true,
    ...options,
    outputJsonPath,
    serializer: hasSerializer ? config.serializer.customSerializer : undefined,
  });

  // Inject the new serializer into the Metro config
  config.serializer = { ...config.serializer, customSerializer: newSerializer };

  return config;
}

function runServer() {
  const configFile = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "./tmp.js",
  );
  const config = { ...discoveryrc, data: "tmp" };

  fs.writeFileSync(
    configFile,
    `module.exports = ${JSON.stringify(config, null, 1).replace(
      '"tmp"',
      `() => require("${outputJsonPath}")`,
    )}`,
  );

  createServer({
    cache: false,
    minify: true,
    dev: false,
    config: configFile,
    configFile,
  }).then((server) => server.listen(8071));
}

let isServerRunning = false;

export async function withRozeniteBundleDiscoveryPlugin(config, options) {
  const metroConfig = await config;
  injectBundleDiscovery(metroConfig, options);

  if (!isServerRunning) {
    isServerRunning = true;
    runServer();
  }

  return metroConfig;
}
