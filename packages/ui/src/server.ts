import fs from "node:fs";
import path from "node:path";
import { createServer } from "@discoveryjs/cli";
import { silent } from "@discoveryjs/cli/lib/shared/utils.js";
import {
  isEsbuildMetafilePath,
  isRsdoctorReportPath,
} from "@react-native-bundle-discovery/shared";
import chalk from "chalk";
import config from "./discoveryrc";

export function serve(filePath: string, port: number, verbose: boolean) {
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

  let fullJsonPath: string;

  try {
    fullJsonPath = require.resolve(jsonFilePath);
  } catch (err) {
    console.error(`❌Error loading file: ${chalk.red(jsonFilePath)}\n\n`);
    console.error((err as Error).message);
    process.exit(1);
  }

  const configFile = path.resolve(__dirname, "./.tmp.js");

  if (verbose) {
    console.info(
      `Creating temporary config file at: ${chalk.green(configFile)}, for discovery.js`,
    );
  }
  // `dist/rsdoctor.js`, emitted next to this bundle
  const transformRcdoctor = path.join(__dirname, "rsdoctor.js");
  fs.writeFileSync(
    configFile,
    `const {transformRSDoctorData, transformEsbuildMetafile, withRecommendations} = require("${transformRcdoctor}");
module.exports = ${JSON.stringify(
      { ...config, data: "<tmp>" },
      null,
      1,
    ).replace(
      `"<tmp>"`,
      isRsdoctorReportPath(fullJsonPath)
        ? `() => withRecommendations(transformRSDoctorData(require("${fullJsonPath}")))`
        : isEsbuildMetafilePath(fullJsonPath)
          ? `() => withRecommendations(transformEsbuildMetafile(require("${fullJsonPath}"), "${fullJsonPath}"))`
          : `() => withRecommendations(require("${fullJsonPath}"))`,
    )};`,
  );

  if (verbose) {
    console.info(`Running server with config: ${chalk.green(configFile)}`);
  }

  return silent(() =>
    createServer({
      cache: false,
      minify: true,
      dev: false,
      config: configFile,
      configFile,
    }).then((server) =>
      server.listen(PORT, () => {
        console.log(
          `[react-native-bundle-discovery]: 🚀 Server listen on ${chalk.green.underline(
            chalk.green(`http://localhost:${PORT}`),
          )}`,
        );
      }),
    ),
  );
}
