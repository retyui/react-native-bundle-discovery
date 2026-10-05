import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import pkg from "../package.json";
import { withPackagesMetadata } from "./packageMetadata";
import type {
  CodeInfo,
  ReportModule,
  ReportPackage,
  TransformOptions,
} from "./types";

const NAME = pkg.name;
const packageRegex = /(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/g;
const textFileRegex = /\.[cm]?[jt]sx?$|\.json$/;

/** Minimal shape of a Rolldown `ModuleInfo` */
interface ModuleInfo {
  code: string | null;
  importedIds: string[];
  dynamicallyImportedIds: string[];
}

/** Minimal shape of a Rolldown `RenderedModule` */
interface RenderedModule {
  code: string | null;
}

/** Minimal shape of a Rolldown `OutputChunk` / `OutputAsset` */
type OutputItem =
  | {
      type: "chunk";
      facadeModuleId: string | null;
      modules: Record<string, RenderedModule>;
    }
  | { type: "asset" };

/** Minimal shape of a Rolldown plugin context */
interface PluginContext {
  getModuleInfo(id: string): ModuleInfo | null;
  resolve(
    source: string,
    importer?: string,
    options?: Record<string, unknown>,
  ): Promise<{ id: string } | null>;
}

/** Minimal shape of the `minifySync` function from `rollipop`'s `rolldownExperimental` */
type MinifySync = (
  filename: string,
  code: string,
  options?: Record<string, unknown>,
) => { code: string };

interface RollipopReport {
  kind: "rollipop";
  date: number;
  entryPoint: string;
  rootFolder: string;
  transformOptions: TransformOptions;
  envs: Record<string, string | undefined>;
  modules: ReportModule[];
  packages: ReportPackage[];
}

export interface BundleDiscoveryRollipopPluginOptions {
  /** Output file name (resolved against the Rollipop `root`). Defaults to `"metro-stats.json"`. */
  filename?: string;
  /** Whether the plugin is enabled. Defaults to `true`. */
  enabled?: boolean;
  /** Include source and bundled code of each module in the report. Defaults to `true`. */
  includeCode?: boolean;
  /** Whether to fetch packages metadata (publish date, deprecation, latest version) from the npm registry. Defaults to `true`. */
  fetchPackagesMetadata?: boolean;
}

const toCodeInfo = (code: string, includeCode: boolean): CodeInfo => ({
  code: includeCode ? code : "",
  lineCount: code ? code.split("\n").length : 0,
  sizeInBytes: Buffer.byteLength(code, "utf-8"),
});

// Virtual modules start with `\0` (e.g. `\0rollipop/entry`)
const toPath = (id: string): string => (id.startsWith("\0") ? id.slice(1) : id);

function readSource(
  id: string,
  transformed: string | null,
  includeCode: boolean,
): CodeInfo {
  if (id.startsWith("\0")) {
    return toCodeInfo(transformed ?? "", includeCode);
  }
  try {
    if (textFileRegex.test(id)) {
      return toCodeInfo(fs.readFileSync(id, "utf-8"), includeCode);
    }
    // Image/font assets are binary – size only
    return { code: "", lineCount: 0, sizeInBytes: fs.statSync(id).size };
  } catch {
    return toCodeInfo(transformed ?? "", includeCode);
  }
}

function getPackages(modulePaths: string[]): ReportPackage[] {
  const packages = new Map<string, ReportPackage>();
  for (const filePath of modulePaths) {
    // Find the LAST `node_modules/<pkg>` segment in the path
    const lastMatch = [...filePath.matchAll(packageRegex)].pop();
    if (!lastMatch || lastMatch.index === undefined) continue;

    const name = lastMatch[1];
    const end = filePath.indexOf(name, lastMatch.index) + name.length;
    const absolutePath = filePath.slice(0, end);
    if (packages.has(absolutePath)) continue;

    let version = "";
    try {
      version = JSON.parse(
        fs.readFileSync(path.join(absolutePath, "package.json"), "utf-8"),
      ).version;
    } catch {
      // Ignore packages without a readable `package.json`
    }
    packages.set(absolutePath, { name, absolutePath, version });
  }
  return Array.from(packages.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

async function loadMinifySync(): Promise<MinifySync | null> {
  try {
    // `rollipop` is ESM only and an optional peer dependency (not resolved at build time)
    const moduleName = "rollipop";
    const rollipop = await import(moduleName);
    return rollipop.rolldownExperimental?.minifySync ?? null;
  } catch {
    return null;
  }
}

/**
 * Rollipop (https://rollipop.dev) plugin
 *   to adapt the Rolldown bundle (modules of the output chunk)
 *   to metro-stats.json format used by `react-native-bundle-discovery`
 */
export function bundleDiscoveryRollipopPlugin({
  filename = "metro-stats.json",
  enabled = true,
  includeCode = true,
  fetchPackagesMetadata = true,
}: BundleDiscoveryRollipopPluginOptions = {}) {
  let rootFolder = process.cwd();
  let dev = false;
  let platform = "ios";
  // importer -> resolved id -> import specifier as written in the code
  const specifiers = new Map<string, Map<string, string>>();

  return {
    name: "react-native-bundle-discovery",

    configResolved(config: { root: string; mode: string }) {
      rootFolder = config.root;
      dev = config.mode === "development";
    },

    options(inputOptions: { resolve?: { extensions?: string[] } }) {
      // Rollipop puts platform extensions first, e.g. `.ios.ts`
      const extensions = inputOptions.resolve?.extensions ?? [];
      platform = extensions[0]?.split(".")[1] || platform;
    },

    async resolveId(
      this: PluginContext,
      source: string,
      importer: string | undefined,
      options: Record<string, unknown>,
    ) {
      if (!enabled || !importer) {
        return null;
      }
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });
      if (resolved) {
        let map = specifiers.get(importer);
        if (!map) {
          map = new Map();
          specifiers.set(importer, map);
        }
        map.set(resolved.id, source);
      }
      return resolved;
    },

    async generateBundle(
      this: PluginContext,
      outputOptions: { minify?: unknown },
      bundle: Record<string, OutputItem>,
    ) {
      if (!enabled) {
        return;
      }
      const startTime = Date.now();
      const chunk = Object.values(bundle).find(
        (item): item is Extract<OutputItem, { type: "chunk" }> =>
          item.type === "chunk",
      );
      if (!chunk) {
        return;
      }

      const minify = Boolean(outputOptions.minify);
      const minifySync = minify ? await loadMinifySync() : null;

      const modules = Object.entries(chunk.modules).map(
        ([id, rendered]): ReportModule => {
          const info = this.getModuleInfo(id);
          let output = rendered.code ?? "";
          if (minifySync && output) {
            try {
              // Rolldown minifies the whole chunk, so minify each module on its own
              // (`unused: false` keeps declarations used by other modules)
              output = minifySync(id, output, {
                compress: { unused: false },
                mangle: { toplevel: true },
              }).code;
            } catch {
              // Keep the unminified code
            }
          }
          const importerSpecifiers = specifiers.get(id);

          return {
            path: toPath(id),
            source: readSource(id, info?.code ?? null, includeCode),
            output: toCodeInfo(output, includeCode),
            dependencies: [
              ...(info?.importedIds ?? []),
              ...(info?.dynamicallyImportedIds ?? []),
            ]
              .filter((dep) => chunk.modules[dep])
              .map((dep) => ({
                absolutePath: toPath(dep),
                name:
                  importerSpecifiers?.get(dep) ??
                  path.relative(path.dirname(id), dep),
              })),
          };
        },
      );

      // The virtual `rollipop/entry` imports the app entry file last
      const facade = chunk.facadeModuleId ?? "";
      const entryPoint = facade.startsWith("\0")
        ? (this.getModuleInfo(facade)?.importedIds.at(-1) ?? facade)
        : facade;

      const report: RollipopReport = {
        kind: "rollipop",
        date: Date.now(),
        entryPoint: toPath(entryPoint),
        rootFolder,
        transformOptions: { dev, minify, platform },
        envs: {},
        modules,
        packages: getPackages(modules.map((m) => m.path)),
      };

      if (fetchPackagesMetadata) {
        report.packages = await withPackagesMetadata(report.packages, {
          onError: (error, pkg) => {
            console.warn(
              `${chalk.yellow(`[${NAME}]`)}: Failed to fetch metadata for ${pkg.name}@${pkg.version}: ${error.message}`,
            );
          },
        });
      }

      const outputPath = path.resolve(rootFolder, filename);
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

      console.log(
        `${chalk.yellow(`[${NAME}]`)}: Saved stats to ${chalk.green(outputPath)} in ${Date.now() - startTime}ms`,
      );
    },
  };
}
