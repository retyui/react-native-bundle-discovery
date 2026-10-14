import fs from "node:fs";
import path from "node:path";
import { createServer } from "@discoveryjs/cli";
import { createSerializer } from "react-native-bundle-discovery";
import discoveryrc from "react-native-bundle-discovery-ui/dist/discoveryrc.js";

type SerializerOptions = NonNullable<Parameters<typeof createSerializer>[0]>;

export type BundleDiscoveryPluginOptions = Omit<
  SerializerOptions,
  "serializer"
>;

interface MetroConfigLike {
  serializer?: {
    customSerializer?: SerializerOptions["serializer"];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const id = Math.floor(Math.random() * 10);
const fileName = `rozenite-metro-stats-${id}.json`; // Random name in case if multiple instances of Metro are running on different ports
const defaultOutputJsonPath = path.resolve(__dirname, "../.stats", fileName);

try {
  fs.unlinkSync(defaultOutputJsonPath);
} catch {
  // Ignore if file does not exist
}

let outputJsonPath = defaultOutputJsonPath;

const SERVER_PORT = 8071; // Also hard-coded in public/index.html

function injectBundleDiscovery<T extends MetroConfigLike>(
  config: T,
  options?: BundleDiscoveryPluginOptions,
): T {
  const hasSerializer = Boolean(config?.serializer?.customSerializer);

  outputJsonPath = options?.outputJsonPath || defaultOutputJsonPath;

  const newSerializer = createSerializer({
    projectRoot: process.cwd(),
    silent: true,
    fetchPackagesMetadata: false,
    ...options,
    outputJsonPath,
    serializer: hasSerializer ? config.serializer?.customSerializer : undefined,
  });

  // Inject the new serializer into the Metro config
  config.serializer = { ...config.serializer, customSerializer: newSerializer };

  return config;
}

function runServer(): void {
  const configFile = path.resolve(__dirname, "./tmp.js");
  const config = { ...discoveryrc, data: "tmp" };

  fs.writeFileSync(
    configFile,
    `module.exports = ${JSON.stringify(config, null, 1).replace(
      '"tmp"',
      `() => require("${require.resolve("react-native-bundle-discovery-ui/dist/rsdoctor.js")}").withRecommendations(require("${outputJsonPath}"))`,
    )}`,
  );

  createServer({
    cache: false,
    minify: true,
    dev: false,
    config: configFile,
    configFile,
  })
    .then((server) => {
      // Several Metro servers can run at once (for example one per git worktree), but the panel
      // server always uses the same port. Without this handler, the second Metro crashes on start
      // with EADDRINUSE. Now it keeps running without its own panel server.
      server.listen(SERVER_PORT).on("error", (error: NodeJS.ErrnoException) => {
        console.warn(
          error.code === "EADDRINUSE"
            ? `[react-native-bundle-discovery] Port ${SERVER_PORT} is already in use, probably by another Metro. The Bundle Discovery panel will show that server's bundle, not this one.`
            : `[react-native-bundle-discovery] Could not start the panel server on port ${SERVER_PORT}: ${error.message}`,
        );
      });
    })
    .catch((error: unknown) => {
      console.warn(
        `[react-native-bundle-discovery] Could not start the panel server: ${String(error)}`,
      );
    });
}

let isServerRunning = false;

export async function withRozeniteBundleDiscoveryPlugin<
  T extends MetroConfigLike,
>(config: T | Promise<T>, options?: BundleDiscoveryPluginOptions): Promise<T> {
  const metroConfig = await config;
  injectBundleDiscovery(metroConfig, options);

  if (!isServerRunning) {
    isServerRunning = true;
    runServer();
  }

  return metroConfig;
}
