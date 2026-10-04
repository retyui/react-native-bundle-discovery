import type { PreparedModule } from "./prepare";

interface TreeNode {
  size: number;
  children: Record<string, TreeNode>;
  path?: string;
  fullPath?: string;
  type?: "file" | "folder";
  files?: number;
}

export interface TreemapNode {
  name: string;
  value: number;
  fullPath?: string;
  files?: number;
  type?: "file" | "folder";
  size: string;
  children?: TreemapNode[];
}

interface TreemapItem {
  id: string;
  name: string;
  parent?: string;
  value?: number;
  color?: string;
}

interface NetworkGraphParams {
  maxParentDepth?: number | string;
  omitVisitedModules?: boolean;
}

type GraphModule = Pick<PreparedModule, "path" | "dependents">;
type PluralForms = [singular: string, plural: string];

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

    return { entryPointPath, data };
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
  isPackageImport(moduleName?: string | null) {
    return moduleName?.[0] !== ".";
  },
  transformFilesList(
    files: { path: string; size: number }[],
    rootFolder: string,
    type: string,
  ) {
    const nodeModulesMap: TreeNode = { children: {}, size: 0 };
    const sourceCodeMap: TreeNode = { children: {}, size: 0 };

    files.forEach(({ path, size }) => {
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

    if (type === "highcharts-treemap") {
      const ROOT_ID_1 = "~";
      const ROOT_ID_2 = ".";
      return (
        [
          { id: ROOT_ID_1, name: "node_modules" },
          { id: ROOT_ID_2, name: "Source Code" },
        ] as TreemapItem[]
      )
        .concat(flattenTree(nodeModulesMap.children.node_modules, ROOT_ID_1))
        .concat(flattenTree(sourceCodeMap, ROOT_ID_2));
    }

    throw new Error(`Unsupported type: ${type}`);
  },
};

function flattenTree(
  node: TreeNode,
  parentId: string,
  prevWasSkipped = false,
  lvl = 0,
  result: TreemapItem[] = [],
  overrideParentId?: string,
): TreemapItem[] {
  const nodeChildrenCount = Object.keys(node.children);

  for (const key of nodeChildrenCount) {
    const childNode = node.children[key];
    const childId = `${parentId}/${key}`;
    const childrenCount = Object.keys(childNode.children).length;
    const hasChildren = childrenCount > 0;
    const item: TreemapItem = {
      id: childId,
      name: prevWasSkipped ? parentId : key,
      parent: overrideParentId ?? parentId,
    };

    if (!hasChildren) {
      item.value = childNode.size;
    }

    if (lvl === 0) {
      item.color = Highcharts.getOptions().colors[randomInt(0, 9)];
    }

    const skipThisNode = nodeChildrenCount.length === 1 && childrenCount === 1;

    if (!skipThisNode) {
      result.push(item);
    }

    flattenTree(
      childNode,
      childId,
      skipThisNode,
      lvl + 1,
      result,
      skipThisNode ? (overrideParentId ?? parentId) : undefined,
    );
  }

  return result;
}

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

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
