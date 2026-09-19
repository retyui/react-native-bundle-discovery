const fs = require("node:fs");
const path = require("node:path");

const chalk = require("chalk");

const { parseBundle } = require("./parseUtils.js");
const NAME = require("./package.json").name;

/**
 * Simple Webpack/Rspack plugin
 *   to adapt stats object https://webpack.js.org/api/stats/
 *   to metro-stats.json format used by `react-native-bundle-discovery`
 */
class BundleDiscoveryPlugin {
  constructor({ filename, options, enabled } = {}) {
    this.options = options;
    this.filename = filename || "metro-stats.json";
    this.enabled = enabled ?? true;
  }

  extractSizesFromJsBundle(statAsset, options) {
    const assetFile = path.join(options.output.path, statAsset.name);
    try {
      return parseBundle(assetFile, {
        sourceType: statAsset.info.javascriptModule ? "module" : "script",
      });
    } catch (e) {
      return null;
    }
  }

  apply(compiler) {
    if (!this.enabled) {
      return;
    }

    compiler.hooks.done.tap("GenerateStatsJsonPlugin", (stats) => {
      // Extract the relevant information from the stats object
      const json = stats.toJson({
        version: true,
        builtAt: true,
        modules: true,
        reasons: true,
        assets: true,
        ids: true,
        ...this.options,
        all: false,
        source: true,
      });
      // Format the stats into the desired structure
      const statsJson = this.formatStat(
        json,
        // Parse JS bundle to extract modules sizes
        // WANR: The stats asset list can contain multiple emitted files and is not guaranteed to put the JavaScript bundle first (and can be empty after a failed compilation)
        this.extractSizesFromJsBundle(json.assets[0], compiler.options),
        compiler.options,
      );
      // Write the formatted stats to the specified output file
      const outputPath = path.resolve(compiler.options.context, this.filename);
      fs.writeFileSync(outputPath, JSON.stringify(statsJson, null, 2));

      console.log(
        `${chalk.yellow(`[${NAME}]`)}: Saved stats to ${chalk.green(
          outputPath,
        )}`,
      );
    });
  }

  readSource(filePath) {
    const fallback = { code: "", lineCount: 0, sizeInBytes: 0 };
    try {
      const code = fs.readFileSync(filePath, "utf-8");
      const lineCount = code.split("\n").length;
      const sizeInBytes = Buffer.byteLength(code, "utf-8");
      return {
        code: this.options?.source === false ? "" : code,
        lineCount,
        sizeInBytes,
      };
    } catch {
      return fallback;
    }
  }

  getPackageName(modulePath) {
    if (!modulePath) {
      return null;
    }
    const parts = modulePath.split("node_modules");
    if (parts.length < 2) {
      return null;
    }
    // WARN: Won't work with `pnpm's nested layout`
    const packagePath = parts[1].split(path.sep).filter(Boolean);
    if (packagePath.length === 0) {
      return null;
    }
    if (packagePath[0].startsWith("@")) {
      return `${packagePath[0]}/${packagePath[1]}`;
    }
    return packagePath[0];
  }
  getAbsolutePath(packageName, modulePath) {
    if (!packageName) {
      return null;
    }
    return modulePath.substring(
      0,
      modulePath.indexOf(packageName) + packageName.length,
    );
  }
  getPackages(statsJson) {
    const packagesMap = statsJson.modules.reduce((allPackages, mdl) => {
      const name = this.getPackageName(mdl.nameForCondition);
      if (!name) {
        return allPackages;
      }
      const absolutePath = this.getAbsolutePath(name, mdl.nameForCondition);
      if (!allPackages.has(absolutePath)) {
        allPackages.set(absolutePath, {
          name,
          absolutePath,
          version: require(path.join(absolutePath, "package.json")).version,
        });
      }
      return allPackages;
    }, new Map());
    return Array.from(packagesMap.values());
  }
  getEntryFile(statsJson, rootFolder) {
    const fallbackValue = path.join(rootFolder, "index.js");
    return (
      statsJson.modules.find(
        (mdl) =>
          !mdl.nameForCondition?.includes("node_modules/") &&
          mdl.reasons?.length === 1 &&
          mdl.reasons?.[0].type === "entry",
      )?.nameForCondition || fallbackValue
    );
  }
  getModuleOutput(mdl, bundleModules) {
    const jsCodeStrFromJSBundle = bundleModules?.modules?.[mdl.id];
    if (jsCodeStrFromJSBundle) {
      const formatted =
        jsCodeStrFromJSBundle.startsWith("function(") &&
        jsCodeStrFromJSBundle.endsWith("}")
          ? jsCodeStrFromJSBundle.replace("function(", "function module(")
          : jsCodeStrFromJSBundle;

      return {
        code: formatted,
        lineCount: formatted.split("\n").length ?? 0,
        sizeInBytes: Buffer.byteLength(jsCodeStrFromJSBundle, "utf-8"),
      };
    }
    return {
      code: mdl.source ?? "",
      lineCount: mdl.source?.split("\n").length ?? 0,
      sizeInBytes: mdl.size ?? 0,
    };
  }

  formatStat(statsJson, bundleModules, compilerOptions) {
    const modulesDeps = this.buildImportsMapFromReasons(
      statsJson,
      compilerOptions,
    );
    return {
      date: statsJson.builtAt || Date.now(),
      entryPoint: this.getEntryFile(statsJson, compilerOptions.context),
      rootFolder: compilerOptions.context,
      // envs: {},
      transformOptions: {
        // customTransformOptions: {},
        dev: compilerOptions.mode !== "production",
        minify: compilerOptions.optimization?.minimize ?? false,
        platform: compilerOptions.name ?? "ios",
        // type: "module",
        // unstable_transformProfile: "default",
      },
      modules: statsJson.modules
        .map((mdl) => {
          if (mdl.type === "runtime modules") {
            if (!bundleModules) {
              return null;
            }
            const sourceAndOutput = {
              code: bundleModules.runtimeSrc ?? "",
              lineCount: bundleModules.runtimeSrc?.split("\n").length ?? 0,
              sizeInBytes: Buffer.byteLength(
                bundleModules.runtimeSrc ?? "",
                "utf-8",
              ),
            };

            return {
              path: "runtime modules", // Can we rename it?
              source: sourceAndOutput,
              output: sourceAndOutput,
              dependencies: [],
            };
          }

          return {
            path: mdl.nameForCondition,
            source: this.readSource(mdl.nameForCondition),
            output: this.getModuleOutput(mdl, bundleModules),
            dependencies: modulesDeps.get(mdl.nameForCondition) ?? [],
          };
        })
        .filter((e) => e !== null),
      packages: this.getPackages(statsJson),
    };
  }

  buildImportsMapFromReasons(statsJson, compilerOptions) {
    const modules = Array.isArray(statsJson?.modules) ? statsJson.modules : [];
    const importsMap = new Map();

    const getAbs = (p) => {
      if (!p || typeof p !== "string") return null;
      if (path.isAbsolute(p)) return p;
      return compilerOptions?.context
        ? path.resolve(compilerOptions?.context, p)
        : p;
    };

    const getModulePath = (m) =>
      m?.path || m?.nameForCondition || m?.identifier || null;

    for (const depModule of modules) {
      const depAbsolutePath = getAbs(getModulePath(depModule));
      if (!depAbsolutePath) continue;

      const reasons = Array.isArray(depModule.reasons) ? depModule.reasons : [];
      for (const reason of reasons) {
        if (reason?.type === "entry") continue;

        // importer (who imports current dep module)
        const importerPath = getAbs(
          reason?.modulePath ||
            reason?.moduleNameForCondition ||
            reason?.resolvedModule ||
            reason?.moduleIdentifier,
        );
        if (!importerPath) continue;

        if (!importsMap.has(importerPath)) {
          importsMap.set(importerPath, []);
        }

        const deps = importsMap.get(importerPath);

        // uniq by absolutePath
        if (!deps.some((d) => d.absolutePath === depAbsolutePath)) {
          deps.push({
            absolutePath: depAbsolutePath,
            name: reason?.userRequest || "",
          });
        }
      }
    }

    return importsMap;
  }
}

module.exports = { BundleDiscoveryPlugin };
