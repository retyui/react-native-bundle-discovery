import { Buffer } from "node:buffer";
import { existsSync, writeFileSync } from "node:fs";
import { parse, resolve } from "node:path";
import chalk from "chalk";
import pkg from "../package.json";
import { keepProcessAlive, withPackagesMetadata } from "./packageMetadata";
import type {
  BundleReport,
  ReportModule,
  ReportPackage,
  TransformOptions,
} from "./types";
import { BundleDiscoveryPlugin } from "./webpack";

const NAME = pkg.name;

/** Minimal shape of a Metro module (`Module` from `metro/src/DeltaBundler/types`) */
interface MetroModule {
  path: string;
  getSource(): Buffer;
  output: ReadonlyArray<{ data: { code: string; lineCount: number } }>;
  dependencies?: Map<
    string,
    { absolutePath?: string | null; data: { name: string } }
  >;
}

/** Minimal shape of a Metro graph (`ReadOnlyGraph` from `metro/src/DeltaBundler/types`) */
interface MetroGraph {
  dependencies: Map<string, MetroModule>;
  transformOptions: TransformOptions;
}

/** Minimal shape of Metro serializer options */
interface MetroSerializerOptions {
  processModuleFilter?: (module: MetroModule) => boolean;
  sentryBundleCallback?: (bundle: unknown) => unknown;
  [key: string]: unknown;
}

type MetroSerializerResult =
  | string
  | { code: string; map: string }
  | Promise<string | { code: string; map: string }>;

type MetroSerializer = (
  entryPoint: string,
  preModules: ReadonlyArray<MetroModule>,
  graph: MetroGraph,
  options: MetroSerializerOptions,
) => MetroSerializerResult;

function getDefault<T>(module: T | { __esModule: true; default: T }): T {
  return (module as { __esModule?: boolean }).__esModule
    ? (module as { default: T }).default
    : (module as T);
}

function getDefaultSerializer(): MetroSerializer {
  const metroPath = parse(require.resolve("metro/package.json")).dir;
  const bundleToString = getDefault<(bundle: unknown) => { code: string }>(
    require(`${metroPath}/src/lib/bundleToString.js`),
  );
  const baseJSBundle = getDefault<
    (
      entryPoint: string,
      preModules: ReadonlyArray<MetroModule>,
      graph: MetroGraph,
      options: MetroSerializerOptions,
    ) => unknown
  >(require(`${metroPath}/src/DeltaBundler/Serializers/baseJSBundle.js`));

  return function defaultSerializer(entryPoint, preModules, graph, options) {
    let bundle = baseJSBundle(entryPoint, preModules, graph, options);

    // Sentry support
    // https://docs.sentry.io/platforms/react-native/manual-setup/metro/#wrap-your-custom-serializer
    if (typeof options?.sentryBundleCallback === "function") {
      bundle = options.sentryBundleCallback(bundle);
    }

    return bundleToString(bundle).code;
  };
}

function getStringSizeInBytes(str: string): number {
  return Buffer.byteLength(str, "utf8");
}

/**
 * `/Users/i/app/node_modules/metro/node_modules/@babel/runtime/helpers/createClass.js` -> `@babel/runtime`
 * `/Users/i/app/node_modules/react/jsx-runtime.js` -> `react`
 */
function getPackageNameFromPath(path: string): string {
  const parts = path.split("node_modules/");
  const lastPart = parts[parts.length - 1];
  if (lastPart.startsWith("@")) {
    return lastPart.split("/").slice(0, 2).join("/");
  }
  return lastPart.split("/")[0];
}

/**
 * `/Users/i/app/node_modules/metro/node_modules/@babel/runtime/helpers/createClass.js` -> `/Users/i/app/node_modules/metro/node_modules/@babel/runtime`
 * `/Users/i/app/node_modules/react/jsx-runtime.js` -> `/Users/i/app/node_modules/react`
 */
function getPackageAbsolutePath(path: string, pkgName: string): string {
  const parts = path.split("node_modules/");
  parts[parts.length - 1] = pkgName;
  return parts.join("node_modules/");
}

function toPackages(modules: ReadonlyArray<MetroModule>): ReportPackage[] {
  const packages = new Map<string, ReportPackage>();
  modules.forEach((module) => {
    if (!module.path.includes("node_modules/")) {
      return;
    }

    const pkgName = getPackageNameFromPath(module.path);
    const absolutePkgPath = getPackageAbsolutePath(module.path, pkgName);

    if (!packages.has(absolutePkgPath)) {
      packages.set(absolutePkgPath, {
        name: pkgName,
        absolutePath: absolutePkgPath,
        version: require(resolve(absolutePkgPath, "package.json")).version,
      });
    }
  });

  return Array.from(packages.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

const IMAGE_FONT_ASSET_RE =
  /\.(png|jpe?g|gif|webp|bmp|psd|tiff?|ico|heic|avif|ttf|otf|woff2?|eot)$/i;

function toModuleStruct(m: MetroModule, includeCode: boolean): ReportModule {
  // Image/font assets are binary – don't read their source
  const sourceCode = IMAGE_FONT_ASSET_RE.test(m.path)
    ? ""
    : m.getSource().toString("utf8");
  const outputCode = m.output[0].data.code;
  return {
    path: m.path,
    source: {
      code: includeCode ? sourceCode : "",
      lineCount: sourceCode ? sourceCode.split("\n").length : 0,
      sizeInBytes: getStringSizeInBytes(sourceCode),
    },
    output: {
      code: includeCode ? outputCode : "",
      lineCount: m.output[0].data.lineCount,
      sizeInBytes: getStringSizeInBytes(outputCode),
    },
    dependencies: Array.from(m?.dependencies?.values?.() ?? [])
      .filter((e) => e.absolutePath)
      .map((e) => ({
        absolutePath: e.absolutePath as string,
        name: e.data.name,
      })),
  };
}

interface CreateJsonReportParams {
  graph: MetroGraph;
  entryPoint: string;
  includeEnvs: string[];
  preModules: ReadonlyArray<MetroModule>;
  includeCode: boolean;
  outputJsonPath: string;
  rootFolder: string;
  silent: boolean;
  options: MetroSerializerOptions | undefined;
  fetchPackagesMetadata: boolean;
}

async function createJsonReport({
  graph,
  entryPoint,
  includeEnvs,
  preModules,
  includeCode,
  outputJsonPath,
  rootFolder,
  silent,
  options,
  fetchPackagesMetadata,
}: CreateJsonReportParams): Promise<void> {
  const startTime = Date.now();
  const { processModuleFilter = () => true } = options || {};
  const dependencies = Array.from(graph.dependencies.values()).filter(
    processModuleFilter,
  );

  let packages: ReportPackage[] = toPackages([
    ...preModules,
    ...dependencies,
  ]);
  const modules = preModules
    .map((m) => toModuleStruct(m, includeCode))
    .concat(dependencies.map((m) => toModuleStruct(m, includeCode)));

  if (fetchPackagesMetadata) {
    packages = await withPackagesMetadata(packages, {
      onError: (error, pkg) => {
        if (!silent) {
          console.warn(
            `${chalk.yellow(`[${NAME}]`)}: Failed to fetch metadata for ${pkg.name}@${pkg.version}: ${error.message}`,
          );
        }
      },
    });
  }

  const stats: BundleReport = {
    date: Date.now(),
    entryPoint,
    transformOptions: graph.transformOptions,
    envs: includeEnvs.reduce<Record<string, string | undefined>>(
      (acc, envName) => {
        acc[envName] = process.env[envName];
        return acc;
      },
      {},
    ),
    rootFolder,
    packages,
    modules,
  };

  writeFileSync(outputJsonPath, JSON.stringify(stats));

  if (!silent) {
    console.log(
      `${chalk.yellow(`[${NAME}]`)}: Saved stats to ${chalk.green(outputJsonPath)} in ${Date.now() - startTime}ms`,
    );
  }
}

interface CreateSerializerOptions {
  /** A custom serializer function. If not provided, a default serializer is used. */
  serializer?: MetroSerializer;
  /** The root directory of the project. Must exist. */
  projectRoot: string;
  /** The path where the JSON report will be saved. Defaults to "metro-stats.json" in the project root. */
  outputJsonPath?: string;
  /** Whether to include the source and output code in the JSON report. Defaults to `true`. */
  includeCode?: boolean;
  /** Whether to suppress log messages. Defaults to `false`. */
  silent?: boolean;
  /** A list of environment variable names to include in the JSON report. Defaults to `[]`. */
  includeEnvs?: string[];
  /** Whether to fetch packages metadata (publish date, deprecation, latest version) from the npm registry. Defaults to `true`. */
  fetchPackagesMetadata?: boolean;
}

/**
 * Creates a custom serializer function for Metro bundler, which generates a JSON report
 * and optionally modifies the serialization process.
 *
 * @param options - Configuration options for the serializer.
 * @returns A custom serializer function to be used by Metro.
 * @throws Throws an error if the project root does not exist.
 */
function createSerializer(
  {
    serializer,
    projectRoot,
    outputJsonPath,
    includeCode = true,
    silent = false,
    includeEnvs = [],
    fetchPackagesMetadata = true,
  }: CreateSerializerOptions = {} as CreateSerializerOptions,
): MetroSerializer {
  const mySerializer = serializer || getDefaultSerializer();

  if (!existsSync(projectRoot)) {
    throw new Error(`[${NAME}]: Project root does not exist: ${projectRoot}`);
  }

  const myOutputJsonPath =
    outputJsonPath ?? resolve(projectRoot, "metro-stats.json");

  function customSerializer(
    entryPoint: string,
    preModules: ReadonlyArray<MetroModule>,
    graph: MetroGraph,
    options: MetroSerializerOptions,
  ): MetroSerializerResult {
    const code = mySerializer(entryPoint, preModules, graph, options);

    // Keeps the Node.js process alive until the report is written
    // (otherwise it can exit while metadata requests are still pending)
    const releaseKeepAlive = keepProcessAlive();

    // Graph/modules are read synchronously before the first `await`,
    // so the report is not affected by later Metro graph mutations
    createJsonReport({
      graph,
      entryPoint,
      includeEnvs,
      preModules,
      includeCode,
      outputJsonPath: myOutputJsonPath,
      rootFolder: projectRoot,
      silent,
      options,
      fetchPackagesMetadata,
    }).finally(releaseKeepAlive);

    return code;
  }

  return customSerializer;
}

/** Minimal shape of a Metro resolution result */
type MetroResolution = { type: string; filePath?: string };

/** Minimal shape of a Metro resolution context */
interface MetroResolutionContext {
  dev: boolean;
  resolveRequest(
    context: MetroResolutionContext,
    moduleName: string,
    platform: string | null,
  ): MetroResolution;
}

const empty = { type: "empty" } as const;

/**
 * Usage:
 *
 * ```js
 * // metro.config.js
 * const { createResolveRequest } = require("react-native-bundle-discovery");
 * const resolveRequest = createResolveRequest({
 *   removePromisePolyfill: true,
 * });
 * const config = {
 *   resolver: {
 *     resolveRequest,
 *   },
 * };
 * ```
 */
const createResolveRequest = ({
  removeNewRenderer = false, // Should be true when new ARCH is disabled
  removePromisePolyfill = false, // Remove useless polyfill (Hermes already has Promise)
  removeUTFSequence = false, // Remove useless code
}: {
  removeNewRenderer?: boolean;
  removePromisePolyfill?: boolean;
  removeUTFSequence?: boolean;
} = {}) => {
  const resolveRequest = (
    context: MetroResolutionContext,
    ...rest: [moduleName: string, platform: string | null]
  ): MetroResolution => {
    const result = context.resolveRequest(context, ...rest);
    if (context.dev) {
      return result;
    }
    if (
      removeUTFSequence &&
      result?.filePath?.endsWith("/react-native/Libraries/UTFSequence.js")
    ) {
      return empty;
    }
    if (
      removePromisePolyfill &&
      result?.filePath?.endsWith("/react-native/Libraries/Promise.js")
    ) {
      return empty;
    }
    if (
      removeNewRenderer &&
      result?.filePath?.endsWith(
        "/react-native/Libraries/Renderer/shims/ReactFabric.js",
      )
    ) {
      return empty;
    }
    return result;
  };
  return resolveRequest;
};

/**
 * @deprecated Use `createResolveRequest` instead.
 */
const createProcessModuleFilter =
  ({
    removePromisePolyfill = false, // Remove useless polyfill (Hermes already has Promise)
    removeUTFSequence = false, // Remove useless code
  }: {
    removePromisePolyfill?: boolean;
    removeUTFSequence?: boolean;
  } = {}) =>
  (module: { path: string }): boolean => {
    if (
      removePromisePolyfill &&
      module.path.endsWith("/react-native/Libraries/Promise.js")
    ) {
      return false;
    }
    if (
      removeUTFSequence &&
      module.path.endsWith("/react-native/Libraries/UTFSequence.js")
    ) {
      return false;
    }

    return true;
  };

export {
  BundleDiscoveryPlugin,
  createProcessModuleFilter,
  createResolveRequest,
  createSerializer,
};
