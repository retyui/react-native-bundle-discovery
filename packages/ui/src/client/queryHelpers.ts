import type { RecommendationFinding } from "@react-native-bundle-discovery/shared";
import type { PreparedModule, PreparedReport } from "./prepare";

interface TreeNode {
  size: number;
  children: Record<string, TreeNode>;
  path?: string;
  fullPath?: string;
  type?: "file" | "folder";
  files?: number;
  issues?: string[];
}

export interface TreemapNode {
  name: string;
  value: number;
  fullPath?: string;
  files?: number;
  type?: "file" | "folder";
  size: string;
  issues?: string[];
  children?: TreemapNode[];
}

export type Severity = "high" | "medium" | "low";

// A finding is "high" when it saves at least 1% of the bundle
const HIGH_SEVERITY_SHARE = 0.01;
const TOP_LIST_SIZE = 8;

interface NetworkGraphParams {
  maxParentDepth?: number | string;
  omitVisitedModules?: boolean;
}

type GraphModule = Pick<
  PreparedModule,
  "path" | "dependents" | "output" | "isEntry"
>;

export interface ImportGraphNode {
  id: string;
  size: number;
  /** Distance from the current module (0 - the module itself) */
  level: number;
  isCurrent: boolean;
  /** Not imported by anything, e.g. the entry point */
  isRoot: boolean;
  isNodeModule: boolean;
}

export interface ImportGraphLink {
  /** The importing module */
  source: string;
  /** The imported module */
  target: string;
}
type PluralForms = [singular: string, plural: string];

const isNodeModule = (m: PreparedModule) => m.path.includes("node_modules/");
const moduleSize = (m: PreparedModule) => m.output.sizeInBytes;

function toListModule(m: PreparedModule) {
  return {
    ext: helpers.getFileExtension(m.path),
    name: m.path,
    size: helpers.formatBytes(moduleSize(m)),
    sizeInBytes: moduleSize(m),
    isEntry: !!m.isEntry,
  };
}

// "react-native@0.80.0" -> "react-native", "@babel/runtime@7.0.0" -> "@babel/runtime"
function stripVersion(id: string) {
  const at = id.lastIndexOf("@");
  return at > 0 ? id.slice(0, at) : id;
}

// Package names to link to: `packages` is a list of `name@version` or a
// free-form text (duplicates: "lodash x2:\n - lodash@4.17.21 (...)")
function getFindingPackageNames(packages: RecommendationFinding["packages"]) {
  if (!packages) return [];
  if (typeof packages === "string") {
    return [packages.split(/ x\d+:/)[0].trim()].filter(Boolean);
  }
  return Array.from(new Set(packages.map(stripVersion)));
}

const modulesByAbsolutePath = new WeakMap<
  PreparedReport,
  Map<string, PreparedModule>
>();
function getModulesByAbsolutePath(report: PreparedReport) {
  let map = modulesByAbsolutePath.get(report);
  if (!map) {
    map = new Map(report.modules.map((m) => [m.absolutePath, m]));
    modulesByAbsolutePath.set(report, map);
  }
  return map;
}

const helpers = {
  prettifyMap: new Map<string, string>(),
  prettifyJS(sourceStr: string) {
    if (helpers.prettifyMap.has(sourceStr)) {
      return helpers.prettifyMap.get(sourceStr);
    }

    // Loaded lazily: prettier is only needed when a module source is shown
    const prettier: typeof import("prettier/standalone") = require("prettier/standalone");
    const prettierPluginBabel: typeof import("prettier/plugins/babel") = require("prettier/plugins/babel");
    const prettierPluginEstree: typeof import("prettier/plugins/estree") = require("prettier/plugins/estree");

    return prettier
      .format(sourceStr, {
        parser: "babel",
        plugins: [prettierPluginBabel, prettierPluginEstree],
      })
      .then((formatted) => {
        helpers.prettifyMap.set(sourceStr, formatted);
        return formatted;
      })
      .catch(() => {
        return sourceStr;
      });
  },
  askChatGPTAboutPackages() {
    const prompt = `I have a list of JavaScript packages from my React Native bundle (see below). I want to optimize bundle size by identifying similar or redundant packages — such as multiple versions of similar libraries (e.g., lodash, lodash-es, underscore, etc.), duplicate utilities, or overlapping functionality (e.g., date libraries like moment, dayjs, date-fns).

Please do the following:

1. Group similar or overlapping packages together.
2. For each group, suggest which one to keep and which ones to consider removing.
3. For each group, provide a regex string that can be used to filter those packages from the list (e.g., in grep, find, or search tools).
4. Keep the output concise and copy-paste friendly.`;
    return `https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`;
  },
  plural(count: number, [singular, plural]: PluralForms) {
    return count === 1 ? singular : plural;
  },
  pluralWithCount(count: number, [singular, plural]: PluralForms) {
    return `${count} ${helpers.plural(count, [singular, plural])}`;
  },
  pluralBadge(count: number, [singular, plural]: PluralForms, prefix = "") {
    return {
      text: prefix + count,
      postfix: helpers.plural(count, [singular, plural]),
    };
  },
  getModulesName(path: string) {
    const modules = path.split("node_modules/");
    const lastModule = modules[modules.length - 1];
    const [folder, subFolder] = lastModule.split("/");
    if (folder.startsWith("@")) {
      return `${folder}/${subFolder}`;
    }
    return folder;
  },
  getBestNetworkGraphSize(module: GraphModule, params?: NetworkGraphParams) {
    let maxParentDepth = 0;
    let itemsCount = 0;
    do {
      maxParentDepth++;
      itemsCount = helpers.getNetworkGraph(module, {
        ...params,
        maxParentDepth,
      }).data.length;
      if (itemsCount < 10) {
        const limit = itemsCount - 1;
        return limit > 2 ? limit : 2;
      }
    } while (maxParentDepth < 6);
    return maxParentDepth;
  },
  getNetworkGraph(
    module: GraphModule,
    { maxParentDepth = 2, omitVisitedModules = true }: NetworkGraphParams = {},
  ) {
    const queue: { module: GraphModule; parentId: string; level: number }[] = [
      { module, parentId: "", level: 0 },
    ];
    const visited = new Set<string>();
    const result: { isEntryPoint: boolean; id: string; parentId: string }[] =
      [];
    let entryPointPath: string | null = null;
    const data: [parentId: string, id: string][] = [];
    const nodes: ImportGraphNode[] = [];

    while (queue.length > 0) {
      const {
        module: currentModule,
        parentId,
        level,
      } = queue.shift() as (typeof queue)[number];

      if (level >= Number(maxParentDepth)) {
        break;
      }

      const id = currentModule.path;

      if (omitVisitedModules) {
        if (visited.has(id)) {
          continue;
        }
        visited.add(id);
      }

      nodes.push({
        id,
        size: currentModule.output.sizeInBytes,
        level,
        isCurrent: level === 0,
        isRoot:
          !!currentModule.isEntry || currentModule.dependents.length === 0,
        isNodeModule: id.includes("node_modules/"),
      });

      if (parentId) {
        const isEntryPoint = currentModule.dependents.length === 0;
        result.push({ isEntryPoint, id, parentId });
        data.push([parentId, id]);
        if (isEntryPoint) {
          entryPointPath = id;
        }
      }

      if (Array.isArray(currentModule.dependents)) {
        for (const dependentModule of currentModule.dependents) {
          queue.push({
            module: dependentModule,
            parentId: id,
            level: level + 1,
          });
        }
      }
    }

    if (!entryPointPath) {
      for (const item of result) {
        if (item.isEntryPoint) {
          entryPointPath = item.id;
          break;
        }
      }
    }

    const links: ImportGraphLink[] = data.map(([parentId, id]) => ({
      source: id,
      target: parentId,
    }));

    return { entryPointPath, data, nodes, links };
  },

  getExtColor(extName: string) {
    const colors: Record<string, string> = {
      js: "#f1e05a50",
      ts: "#2b748950",
      tsx: "#2b748950",
      json: "#e34c2650",
      svg: "#e69f0d50",
      css: "#563d7c50",
      png: "#e44b2350",
    };
    return colors[extName] ?? colors.js;
  },
  getFileExtension(filename: string) {
    const idx = filename.lastIndexOf(".");
    return idx === -1 ? "js" : filename.slice(idx + 1);
  },
  // "2022-06-14T19:46:38.369Z" -> "2022-06-14"
  formatDate(isoDate?: string | null) {
    return isoDate ? new Date(isoDate).toISOString().slice(0, 10) : "";
  },
  // "2022-06-14T19:46:38.369Z" -> "3 years ago"
  timeAgo(isoDate?: string | null) {
    if (!isoDate) return "";
    const days = Math.floor(
      (Date.now() - new Date(isoDate).getTime()) / 86_400_000,
    );
    const [count, unit]: [number, PluralForms] =
      days >= 365
        ? [Math.floor(days / 365), ["year", "years"]]
        : days >= 30
          ? [Math.floor(days / 30), ["month", "months"]]
          : [days, ["day", "days"]];
    return count === 0
      ? "today"
      : `${helpers.pluralWithCount(count, unit)} ago`;
  },
  toFixed(value: unknown, fractionDigits = 2) {
    return Number(value).toFixed(fractionDigits);
  },
  percent(value: number, fractionDigits = 2) {
    return `${(100 * value).toFixed(fractionDigits)}%`;
  },
  formatBytes(bytes: number, decimals?: number) {
    // biome-ignore lint/suspicious/noDoubleEquals: kept loose as in the original (jora may pass non-numbers)
    if (bytes == 0) return "0 Bytes";
    const k = 1024,
      dm = decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  },
  // Everything the module page header and stat cards need, in one pass
  moduleOverview(report: PreparedReport, id: string) {
    const module = report.modules.find((m) => m.path === id);
    if (!module) return null;

    const size = (m: PreparedModule) => m.output.sizeInBytes;
    const totalSize = report.modules.reduce((acc, m) => acc + size(m), 0);
    const largest = report.modules.reduce(
      (acc, m) => Math.max(acc, size(m)),
      0,
    );
    const rank =
      report.modules.filter((m) => size(m) > size(module)).length + 1;
    const byAbsolutePath = new Map(
      report.modules.map((m) => [m.absolutePath, m]),
    );

    const slash = module.path.lastIndexOf("/");
    const toModule = (m: PreparedModule) => ({
      ext: helpers.getFileExtension(m.path),
      name: m.path,
      size: helpers.formatBytes(size(m)),
      sizeInBytes: size(m),
      isEntry: m.isEntry,
    });

    let pkg = null;
    if (module.path.includes("node_modules/")) {
      const name = helpers.getModulesName(module.path);
      const marker = `node_modules/${name}/`;
      const path = module.path.slice(
        0,
        module.path.lastIndexOf(marker) + marker.length - 1,
      );
      const info = report.packages.find((p) => p.path === path);
      const files = report.modules.filter((m) => m.path.startsWith(`${path}/`));
      const pkgSize = files.reduce((acc, m) => acc + size(m), 0);
      pkg = {
        name,
        path,
        version: info?.version,
        metadata: info?.metadata,
        size: pkgSize,
        files: files.length,
        share: pkgSize ? size(module) / pkgSize : 0,
      };
    }

    const imports = module.dependencies
      .map((d) => {
        const m = byAbsolutePath.get(d.absolutePath);
        return m
          ? { specifier: d.name, ...toModule(m), missing: false }
          : {
              specifier: d.name,
              ext: helpers.getFileExtension(d.path),
              name: d.path,
              size: "",
              sizeInBytes: -1,
              isEntry: false,
              missing: true,
            };
      })
      .sort((a, b) => b.sizeInBytes - a.sizeInBytes);

    const importerPackages = new Set(
      module.dependents.map((m) =>
        m.path.includes("node_modules/") ? helpers.getModulesName(m.path) : "",
      ),
    );

    return {
      path: module.path,
      dir: module.path.slice(0, slash + 1),
      file: module.path.slice(slash + 1),
      ext: helpers.getFileExtension(module.path),
      isEntry: !!module.isEntry,
      // Code added by the bundler itself (the same rules as the page warnings)
      injectedBy:
        module.path === "__runtime__"
          ? "Webpack/Rspack"
          : module.path === "__prelude__" ||
              module.path.includes("@react-native/js-polyfills") ||
              module.path.includes("metro-runtime")
            ? "Metro"
            : null,
      outputSize: size(module),
      sourceSize: module.source.sizeInBytes,
      outputLines: module.output.lineCount,
      sourceLines: module.source.lineCount,
      totalSize,
      bundleShare: totalSize ? size(module) / totalSize : 0,
      largestShare: largest ? size(module) / largest : 0,
      rank,
      modulesCount: report.modules.length,
      pkg,
      imports,
      missingImports: imports.filter((i) => i.missing).length,
      importedBy: module.dependents.length,
      importerPackages: importerPackages.size,
      importedByOwnCode: importerPackages.has(""),
      duplicates: module.duplicates.length,
      duplicatesSize: module.duplicates.reduce((acc, m) => acc + size(m), 0),
    };
  },
  // Everything the "Insights" tab needs, in one pass
  bundleInsights(report: PreparedReport) {
    const totalSize = report.modules.reduce((acc, m) => acc + moduleSize(m), 0);
    const share = (bytes: number) => (totalSize ? bytes / totalSize : 0);
    const modulesByPath = new Map(report.modules.map((m) => [m.path, m]));

    // Packages: grouped by name, all copies together
    const packages = new Map<string, { size: number; copies: Set<string> }>();
    let nodeModulesSize = 0;
    const ownModules: PreparedModule[] = [];
    for (const m of report.modules) {
      if (!isNodeModule(m)) {
        ownModules.push(m);
        continue;
      }
      nodeModulesSize += moduleSize(m);
      const name = helpers.getModulesName(m.path);
      const marker = `node_modules/${name}/`;
      const pkg = packages.get(name) ?? { size: 0, copies: new Set() };
      pkg.size += moduleSize(m);
      pkg.copies.add(m.path.slice(0, m.path.lastIndexOf(marker)));
      packages.set(name, pkg);
    }
    const sourceSize = totalSize - nodeModulesSize;
    const largestPackage = Math.max(
      0,
      ...[...packages.values()].map((p) => p.size),
    );
    const largestOwnModule = Math.max(0, ...ownModules.map(moduleSize));

    // Findings: the heaviest savings first, a module is counted only once
    // in the total, even if several findings are about it
    const countedModules = new Set<string>();
    let potentialSavings = 0;
    const findings = (report.recommendations ?? [])
      .map((finding) => {
        const savings = finding.sizeInBytes ?? 0;
        const affected = (finding.modules ?? [])
          .map((path) => modulesByPath.get(path))
          .filter((m): m is PreparedModule => !!m)
          .sort((a, b) => moduleSize(b) - moduleSize(a));
        const severity: Severity =
          savings && share(savings) >= HIGH_SEVERITY_SHARE
            ? "high"
            : savings
              ? "medium"
              : "low";
        return {
          ...finding,
          severity,
          savings,
          savingsShare: share(savings),
          packageNames: getFindingPackageNames(finding.packages),
          // Duplicates list copies with versions & paths as text
          packagesText:
            typeof finding.packages === "string" ? finding.packages : null,
          docsUrls: [finding.docsUrl ?? []].flat(),
          affected: affected.map(toListModule),
          affectedSize: affected.reduce((acc, m) => acc + moduleSize(m), 0),
        };
      })
      .sort((a, b) => b.savings - a.savings);

    for (const finding of findings) {
      if (!finding.savings) continue;
      const overlap = finding.affected
        .filter((m) => countedModules.has(m.name))
        .reduce((acc, m) => acc + m.sizeInBytes, 0);
      potentialSavings += Math.max(finding.savings - overlap, 0);
      for (const m of finding.affected) countedModules.add(m.name);
    }

    const duplicatePackages = [...packages.values()].filter(
      (p) => p.copies.size > 1,
    ).length;

    return {
      platform: report.transformOptions?.platform,
      isDev: report.transformOptions?.dev !== false,
      hasRecommendations: report.recommendations !== null,
      totalSize,
      modulesCount: report.modules.length,
      sourceSize,
      sourceShare: share(sourceSize),
      ownModulesCount: ownModules.length,
      nodeModulesSize,
      nodeModulesShare: share(nodeModulesSize),
      packagesCount: packages.size,
      duplicatePackages,
      duplicateModules: report.modules.filter((m) => m.duplicates.length)
        .length,
      potentialSavings,
      potentialSavingsShare: share(potentialSavings),
      findings,
      findingsWithSavings: findings.filter((f) => f.savings).length,
      topPackages: [...packages.entries()]
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, TOP_LIST_SIZE)
        .map(([name, pkg]) => ({
          name,
          size: pkg.size,
          share: share(pkg.size),
          bar: largestPackage ? pkg.size / largestPackage : 0,
          copies: pkg.copies.size,
        })),
      topPackagesShare: share(
        [...packages.values()]
          .map((p) => p.size)
          .sort((a, b) => b - a)
          .slice(0, 5)
          .reduce((acc, size) => acc + size, 0),
      ),
      topOwnModules: [...ownModules]
        .sort((a, b) => moduleSize(b) - moduleSize(a))
        .slice(0, TOP_LIST_SIZE)
        .map((m) => ({
          name: m.path,
          size: moduleSize(m),
          share: share(moduleSize(m)),
          bar: largestOwnModule ? moduleSize(m) / largestOwnModule : 0,
        })),
    };
  },
  // Shortest import chain from the entry point to the first module of the package:
  // answers "Why is this package in my bundle?"
  importChain(report: PreparedReport, pkgName: string) {
    const isTarget = (m: PreparedModule) =>
      isNodeModule(m) && helpers.getModulesName(m.path) === pkgName;
    const byAbsolutePath = getModulesByAbsolutePath(report);

    const search = (starts: PreparedModule[]) => {
      const prev = new Map<PreparedModule, PreparedModule | null>();
      const queue = [...starts];
      for (const start of starts) prev.set(start, null);
      while (queue.length) {
        const current = queue.shift() as PreparedModule;
        if (isTarget(current)) {
          const chain: PreparedModule[] = [];
          for (
            let m: PreparedModule | null = current;
            m;
            m = prev.get(m) ?? null
          ) {
            chain.unshift(m);
          }
          return chain;
        }
        for (const dependency of current.dependencies) {
          const next = byAbsolutePath.get(dependency.absolutePath);
          if (next && !prev.has(next)) {
            prev.set(next, current);
            queue.push(next);
          }
        }
      }
      return null;
    };

    const entry = report.modules.filter((m) => m.isEntry);
    let chain = search(entry);
    let fromEntry = true;
    if (!chain) {
      // e.g. polyfills that the bundler runs before the entry point
      chain = search(report.modules.filter((m) => m.dependents.length === 0));
      fromEntry = false;
    }
    if (!chain) return null;

    return {
      fromEntry,
      steps: chain.map((m, index) => {
        const pkg = isNodeModule(m) ? helpers.getModulesName(m.path) : null;
        const prevModule = chain[index - 1];
        const prevPkg =
          prevModule && isNodeModule(prevModule)
            ? helpers.getModulesName(prevModule.path)
            : null;
        return {
          ...toListModule(m),
          pkg,
          // The step where the chain enters another package
          entersPackage: index > 0 && pkg !== prevPkg ? pkg : null,
          isTarget: index === chain.length - 1,
        };
      }),
    };
  },
  isPackageImport(moduleName?: string | null) {
    return moduleName?.[0] !== ".";
  },
  transformFilesList(
    files: { path: string; size: number; issues?: string[] }[],
    rootFolder: string,
    type: string,
  ) {
    const nodeModulesMap: TreeNode = { children: {}, size: 0 };
    const sourceCodeMap: TreeNode = { children: {}, size: 0 };

    files.forEach(({ path, size, issues }) => {
      if (path === "__prelude__") {
        path = "node_modules/__prelude__";
      }
      if (path === "__runtime__") {
        path = "node_modules/__runtime__";
      }

      const shortPath = path.replace(`${rootFolder}/`, "");
      const isNodeModule = shortPath.includes("node_modules/");
      const parts = shortenPath(shortPath, nodeModulesMap).split("/");
      let current = (isNodeModule ? nodeModulesMap : sourceCodeMap).children;

      parts.forEach((part, index) => {
        // console.log((" --- xdebug " + index + " ".repeat(50)).substr(0, 40), {
        //   part,
        //   parts,
        // });
        if (!current[part]) {
          current[part] = { size: 0, children: {} };
        }

        if (index === parts.length - 1) {
          current[part].size = size;
          current[part].path = shortPath;
          current[part].fullPath = path;
          current[part].issues = issues;
        }

        current = current[part].children;
      });
    });

    if (type === "treemap") {
      sumSizes(nodeModulesMap);
      sumSizes(sourceCodeMap);

      const roots: TreemapNode[] = [];
      if (Object.keys(sourceCodeMap.children).length > 0) {
        roots.push(toTreemapNode(sourceCodeMap, "Source Code"));
      }
      if (nodeModulesMap.children.node_modules) {
        roots.push(
          toTreemapNode(nodeModulesMap.children.node_modules, "node_modules"),
        );
      }

      return roots;
    }

    throw new Error(`Unsupported type: ${type}`);
  },
};

function sumSizes(node: TreeNode): { totalSize: number; totalFiles: number } {
  const isFile = Object.keys(node.children).length === 0;
  let totalFiles = isFile ? 1 : 0;
  let totalSize = node.size || 0;
  for (const key in node.children) {
    const result = sumSizes(node.children[key]);
    totalSize += result.totalSize;
    totalFiles += result.totalFiles;
  }
  node.type = isFile ? "file" : "folder";
  node.size = totalSize;
  node.files = totalFiles;
  return { totalSize, totalFiles };
}

function toTreemapNode(node: TreeNode, name: string): TreemapNode {
  const keys = Object.keys(node.children);

  const common: TreemapNode = {
    name,
    value: node.size,
    fullPath: node.fullPath,
    files: node.files,
    type: node.type,
    size: helpers.formatBytes(node.size),
    issues: node.issues,
  };

  if (keys.length === 0) {
    // File
    return common;
  }

  // Folder
  return Object.assign(common, {
    children: keys.map((key) => toTreemapNode(node.children[key], key)),
  });
}

const nm = "node_modules/";
function shortenPath(path: string, nodeModulesMap: TreeNode) {
  if (path.startsWith(`${nm}.pnpm/`)) {
    path = path.replaceAll(`${nm}.pnpm/`, "");
  }
  const index = path.lastIndexOf(nm);

  if (index > 0) {
    const pathWithoutNestedNM = path.slice(index);
    // Find the package name after "node_modules/"
    const firstSlash = pathWithoutNestedNM.indexOf("/");
    const secondSlash = pathWithoutNestedNM.indexOf("/", firstSlash + 1);
    const pkgName =
      secondSlash === -1
        ? pathWithoutNestedNM.slice(firstSlash + 1)
        : pathWithoutNestedNM.slice(firstSlash + 1, secondSlash);

    if (nodeModulesMap?.children?.node_modules?.children?.[pkgName]) {
      const parentPackage = helpers.getModulesName(path.slice(0, index));
      return `${nm + parentPackage} ~ ${pathWithoutNestedNM.slice(nm.length)}`;
    }

    return pathWithoutNestedNM;
  }
  return path;
}

export default helpers;
