const { parse, resolve } = require("path");
const { writeFileSync, existsSync } = require("fs");
const { Buffer } = require("buffer");
const chalk = require("chalk");
const BundleDiscoveryPlugin = require("./webpack").BundleDiscoveryPlugin;
const { withPackagesMetadata } = require("./packageMetadata");
const NAME = require("./package.json").name;

function getDefault(module) {
  return module.__esModule ? module.default : module;
}

function getDefaultSerializer() {
  const metroPath = parse(require.resolve("metro/package.json")).dir;
  const bundleToString = getDefault(
    require(`${metroPath}/src/lib/bundleToString.js`),
  );
  const baseJSBundle = getDefault(
    require(`${metroPath}/src/DeltaBundler/Serializers/baseJSBundle.js`),
  );

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

function getStringSizeInBytes(str) {
  return Buffer.byteLength(str, "utf8");
}

/**
 * `/Users/i/app/node_modules/metro/node_modules/@babel/runtime/helpers/createClass.js` -> `@babel/runtime`
 * `/Users/i/app/node_modules/react/jsx-runtime.js` -> `react`
 */
function getPackageNameFromPath(path) {
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
function getPackageAbsolutePath(path, pkgName) {
  const parts = path.split("node_modules/");
  parts[parts.length - 1] = pkgName;
  return parts.join("node_modules/");
}

function toPackages(modules) {
  const packages = new Map();
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

function toModuleStruct(m, includeCode) {
  const sourceCode = m.getSource().toString("utf8");
  const outputCode = m.output[0].data.code;
  return {
    path: m.path,
    source: {
      code: includeCode ? sourceCode : "",
      lineCount: sourceCode.split("\n").length,
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
        absolutePath: e.absolutePath,
        name: e.data.name,
      })),
  };
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
}) {
  const { processModuleFilter = () => true } = options || {};
  const dependencies = Array.from(graph.dependencies.values()).filter(
    processModuleFilter,
  );

  let packages = toPackages(preModules).concat(toPackages(dependencies));
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

  const stats = {
    date: Date.now(),
    entryPoint,
    transformOptions: graph.transformOptions,
    envs: includeEnvs.reduce((acc, envName) => {
      acc[envName] = process.env[envName];
      return acc;
    }, {}),
    rootFolder,
    packages,
    modules,
  };

  writeFileSync(outputJsonPath, JSON.stringify(stats));

  if (!silent) {
    console.log(
      `${chalk.yellow(`[${NAME}]`)}: Saved stats to ${chalk.green(outputJsonPath)}`,
    );
  }
}

/**
 * Creates a custom serializer function for Metro bundler, which generates a JSON report
 * and optionally modifies the serialization process.
 *
 * @param {Object} options - Configuration options for the serializer.
 * @param {Function} [options.serializer] - A custom serializer function. If not provided, a default serializer is used.
 * @param {string} options.projectRoot - The root directory of the project. Must exist.
 * @param {string} [options.outputJsonPath] - The path where the JSON report will be saved. Defaults to "metro-stats.json" in the project root.
 * @param {boolean} [options.includeCode=true] - Whether to include the source and output code in the JSON report.
 * @param {string[]} [options.includeEnvs=[]] - A list of environment variable names to include in the JSON report.
 * @param {boolean} [options.fetchPackagesMetadata=true] - Whether to fetch packages metadata (publish date, deprecation, latest version) from the npm registry.
 * @returns {Function} - A custom serializer function to be used by Metro.
 * @throws {Error} - Throws an error if the project root does not exist.
 */
function createSerializer({
  serializer,
  projectRoot,
  outputJsonPath,
  includeCode = true,
  silent = false,
  includeEnvs = [],
  fetchPackagesMetadata = true,
} = {}) {
  const mySerializer = serializer || getDefaultSerializer();

  if (!existsSync(projectRoot)) {
    throw new Error(`[${NAME}]: Project root does not exist: ${projectRoot}`);
  }

  const myOutputJsonPath =
    outputJsonPath ?? resolve(projectRoot, "metro-stats.json");

  function customSerializer(entryPoint, preModules, graph, options) {
    const code = mySerializer(entryPoint, preModules, graph, options);

    // Keeps the Node.js process alive until the report is written
    // (otherwise it can exit while metadata requests are still pending)
    const keepAlive = setInterval(() => {}, 1000);

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
    }).finally(() => clearInterval(keepAlive));

    return code;
  }

  return customSerializer;
}

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
const empty = { type: "empty" };
const createResolveRequest = ({
  removeNewRenderer = false, // Should be true when new ARCH is disabled
  removeUTFSequence = false, // Remove useless code
} = {}) => {
  const resolveRequest = (context, ...rest) => {
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
  } = {}) =>
  (module) => {
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

module.exports = {
  createSerializer,
  createResolveRequest,
  createProcessModuleFilter,
  BundleDiscoveryPlugin,
};
