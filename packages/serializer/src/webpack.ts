import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import pkg from "../package.json";
import { withPackagesMetadata } from "./packageMetadata";
import { parseBundle } from "./parseUtils";
import type {
  CodeInfo,
  ReportModule,
  ReportModuleDependency,
  ReportPackage,
  TransformOptions,
} from "./types";

const NAME = pkg.name;
const packageRegex = /(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/g;

/** Options passed to `stats.toJson()` (https://webpack.js.org/configuration/stats/) */
type StatsOptions = Record<string, unknown>;

/** Minimal shape of the (normalized) Webpack/Rspack compiler options used by the plugin */
interface CompilerOptions {
  context?: string;
  mode?: string;
  name?: string;
  output: { path?: string };
  optimization?: { minimize?: boolean };
}

/** Minimal shape of a Webpack/Rspack `Stats` object */
interface Stats {
  toJson(options: StatsOptions): unknown;
}

/** Minimal shape of a Webpack/Rspack `Compiler` */
interface Compiler {
  options: CompilerOptions;
  hooks: {
    done: {
      tap(name: string, callback: (stats: Stats) => void): void;
    };
  };
}

interface StatsReason {
  type?: string;
  modulePath?: string;
  moduleNameForCondition?: string;
  resolvedModule?: string;
  moduleIdentifier?: string;
  userRequest?: string;
}

interface StatsModule {
  id?: string | number;
  type?: string;
  path?: string;
  identifier?: string;
  nameForCondition?: string;
  source?: string;
  size?: number;
  reasons?: StatsReason[];
}

interface StatsAsset {
  name: string;
  info: { javascriptModule?: boolean };
}

interface StatsJson {
  builtAt?: number;
  assets: StatsAsset[];
  modules: StatsModule[];
}

type ParsedBundle = ReturnType<typeof parseBundle>;

interface WebpackReport {
  kind: "webpack";
  date: number;
  entryPoint: string;
  rootFolder: string;
  transformOptions: TransformOptions;
  modules: ReportModule[];
  packages: ReportPackage[];
}

interface BundleDiscoveryPluginOptions {
  /** Output file name (resolved against the compiler `context`). Defaults to `"metro-stats.json"`. */
  filename?: string;
  /** Extra options passed to `stats.toJson()`. */
  options?: StatsOptions;
  /** Whether the plugin is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Whether to fetch packages metadata (publish date, deprecation, latest version) from the npm registry. Defaults to `true`. */
  fetchPackagesMetadata?: boolean;
}

/**
 * Simple Webpack/Rspack plugin
 *   to adapt stats object https://webpack.js.org/api/stats/
 *   to metro-stats.json format used by `react-native-bundle-discovery`
 */
export class BundleDiscoveryPlugin {
  options: StatsOptions | undefined;
  filename: string;
  enabled: boolean;
  fetchPackagesMetadata: boolean;

  constructor({
    filename,
    options,
    enabled,
    fetchPackagesMetadata,
  }: BundleDiscoveryPluginOptions = {}) {
    this.options = options;
    this.filename = filename || "metro-stats.json";
    this.enabled = enabled ?? true;
    this.fetchPackagesMetadata = fetchPackagesMetadata ?? true;
  }

  extractSizesFromJsBundle(
    statAsset: StatsAsset,
    options: CompilerOptions,
  ): ParsedBundle | null {
    const assetFile = path.join(options.output.path as string, statAsset.name);
    try {
      return parseBundle(assetFile, {
        sourceType: statAsset.info.javascriptModule ? "module" : "script",
      });
    } catch {
      return null;
    }
  }

  apply(compiler: Compiler): void {
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
      }) as StatsJson;

      // Format the stats into the desired structure
      const statsJson = this.formatStat(
        json,
        // Parse JS bundle to extract modules sizes
        // WANR: The stats asset list can contain multiple emitted files and is not guaranteed to put the JavaScript bundle first (and can be empty after a failed compilation)
        this.extractSizesFromJsBundle(json.assets[0], compiler.options),
        compiler.options,
      );
      // Write the formatted stats to the specified output file
      const outputPath = path.resolve(
        compiler.options.context as string,
        this.filename,
      );

      // Keeps the Node.js process alive until the report is written
      // (otherwise it can exit while metadata requests are still pending)
      const keepAlive = setInterval(() => {}, 1000);

      this.writeReport(statsJson, outputPath)
        .catch((error: Error) => {
          console.error(
            `${chalk.yellow(`[${NAME}]`)}: Failed to create JSON report: ${error.message}`,
          );
        })
        .finally(() => clearInterval(keepAlive));
    });
  }

  async writeReport(
    statsJson: WebpackReport,
    outputPath: string,
  ): Promise<void> {
    if (this.fetchPackagesMetadata) {
      statsJson.packages = await withPackagesMetadata(statsJson.packages, {
        onError: (error, pkg) => {
          console.warn(
            `${chalk.yellow(`[${NAME}]`)}: Failed to fetch metadata for ${pkg.name}@${pkg.version}: ${error.message}`,
          );
        },
      });
    }

    fs.writeFileSync(outputPath, JSON.stringify(statsJson, null, 2));

    console.log(
      `${chalk.yellow(`[${NAME}]`)}: Saved stats to ${chalk.green(outputPath)}`,
    );
  }

  readSource(filePath: string): CodeInfo {
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

  getPkgVersionFromPath(path: string): string | null {
    try {
      // Extract the segment right before node_modules in `.pnpm/.../node_modules/`
      const matches = [...path.matchAll(/\.pnpm\/([^/]+)\/node_modules/g)];
      if (!matches.length) return null;

      const lastPnpmFolder = matches[matches.length - 1][1];

      // Folder format is `<name>@<version>[_<peers>]`, where `<name>` may be scoped
      // (`@scope+name`, `@scope_name`), so skip the leading `@` of the scope
      const versionMatch = lastPnpmFolder.match(/^@?[^@]+@([^_]+)/);

      return versionMatch ? versionMatch[1] : null;
    } catch {
      return "";
    }
  }

  getPackages(statsJson: StatsJson): ReportPackage[] {
    const packagesMap = new Map<string, ReportPackage>();

    for (const mdl of statsJson.modules) {
      const filePath = mdl.nameForCondition;
      if (!filePath) {
        continue;
      }

      let lastMatch: RegExpExecArray | null = null;

      // Reset regex state for global matching
      packageRegex.lastIndex = 0;

      // Find the LAST valid node_modules/<pkg> pattern in the path
      let match = packageRegex.exec(filePath);
      while (match !== null) {
        lastMatch = match;
        match = packageRegex.exec(filePath);
      }

      if (!lastMatch) continue;

      const packageName = lastMatch[1];
      const matchIndex = lastMatch.index;

      // Account for potential leading slash in the regex match
      const prefixOffset = filePath[matchIndex] === "/" ? 1 : 0;
      const cutIndex =
        matchIndex + prefixOffset + "node_modules/".length + packageName.length;

      const absolutePath = filePath.slice(0, cutIndex);

      let version = "";
      try {
        version = require(path.join(absolutePath, "package.json")).version;
      } catch (e) {
        const verFromPath = this.getPkgVersionFromPath(absolutePath);
        if (verFromPath) {
          version = verFromPath;
        } else {
          if (
            (e as NodeJS.ErrnoException | undefined)?.code ===
            "MODULE_NOT_FOUND"
          ) {
            console.warn(`[${NAME}] getPackages: unexpected path resolution`, {
              filePath,
              absolutePath,
            });
          } else {
            throw e;
          }
        }
      }

      if (!packagesMap.has(absolutePath)) {
        packagesMap.set(absolutePath, {
          name: packageName,
          absolutePath: absolutePath,
          version: version,
        });
      }
    }
    return Array.from(packagesMap.values());
  }
  getEntryFile(statsJson: StatsJson, rootFolder: string): string {
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
  getModuleOutput(
    mdl: StatsModule,
    bundleModules: ParsedBundle | null,
  ): CodeInfo {
    const jsCodeStrFromJSBundle = bundleModules?.modules?.[String(mdl.id)];
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

  formatStat(
    statsJson: StatsJson,
    bundleModules: ParsedBundle | null,
    compilerOptions: CompilerOptions,
  ): WebpackReport {
    const modulesDeps = this.buildImportsMapFromReasons(
      statsJson,
      compilerOptions,
    );
    const context = compilerOptions.context as string;

    return {
      kind: "webpack",
      date: statsJson.builtAt || Date.now(),
      entryPoint: this.getEntryFile(statsJson, context),
      rootFolder:
        this.findCommonRoot(
          statsJson.modules
            .map((m) => m.nameForCondition)
            .filter((p): p is string => Boolean(p)),
        ) || context,
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
        .map((mdl): ReportModule | null => {
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
              path: "__runtime__",
              source: sourceAndOutput,
              output: sourceAndOutput,
              dependencies: [],
            };
          }

          // Modules without a path are dropped by the `.filter()` below
          if (!mdl.nameForCondition) {
            return null;
          }

          return {
            path: mdl.nameForCondition,
            source: this.readSource(mdl.nameForCondition),
            output: this.getModuleOutput(mdl, bundleModules),
            dependencies: modulesDeps.get(mdl.nameForCondition) ?? [],
          };
        })
        .filter((e): e is ReportModule => e !== null && Boolean(e.path)),
      packages: this.getPackages(statsJson),
    };
  }

  buildImportsMapFromReasons(
    statsJson: StatsJson,
    compilerOptions: CompilerOptions,
  ): Map<string, ReportModuleDependency[]> {
    const modules = Array.isArray(statsJson?.modules) ? statsJson.modules : [];
    const importsMap = new Map<string, ReportModuleDependency[]>();

    const getAbs = (p: string | null | undefined): string | null => {
      if (!p || typeof p !== "string") return null;
      if (path.isAbsolute(p)) return p;
      return compilerOptions?.context
        ? path.resolve(compilerOptions?.context, p)
        : p;
    };

    const getModulePath = (m: StatsModule | undefined): string | null =>
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

        let deps = importsMap.get(importerPath);
        if (!deps) {
          deps = [];
          importsMap.set(importerPath, deps);
        }

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

  findCommonRoot(paths: string[]): string {
    if (!paths || paths.length === 0) return "";
    if (paths.length === 1) {
      const lastSlash = paths[0].lastIndexOf("/");
      return lastSlash === -1 ? "" : paths[0].slice(0, lastSlash);
    }

    const first = paths[0];
    let maxLen = first.length;

    // Short-circuit scanning loop across all paths
    for (let i = 1; i < paths.length; i++) {
      const current = paths[i];
      const limit = Math.min(maxLen, current.length);
      let j = 0;

      // Fast character match using engine string optimizations
      while (j < limit && first.charCodeAt(j) === current.charCodeAt(j)) {
        j++;
      }

      maxLen = j;
      if (maxLen === 0) return "";
    }

    // Exact match down to the root or full path segment
    if (maxLen === first.length) {
      const lastSlash = first.lastIndexOf("/");
      return lastSlash === -1 ? "" : first.slice(0, lastSlash);
    }

    // Truncate to the last valid '/' boundary within maxLen
    const commonSlice = first.slice(0, maxLen);
    const lastSlash = commonSlice.lastIndexOf("/");

    return lastSlash === -1 ? "" : commonSlice.slice(0, lastSlash);
  }
}
