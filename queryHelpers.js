const helpers = {
  prettifyMap: new Map(),
  prettifyJS(sourceStr) {
    if (helpers.prettifyMap.has(sourceStr)) {
      return helpers.prettifyMap.get(sourceStr);
    }

    const prettier = require("prettier/standalone");
    const prettierPluginBabel = require("prettier/plugins/babel");
    const prettierPluginEstree = require("prettier/plugins/estree");

    return prettier
      .format(sourceStr, {
        parser: "babel",
        plugins: [prettierPluginBabel, prettierPluginEstree],
      })
      .then((formatted) => {
        helpers.prettifyMap.set(sourceStr, formatted);
        return formatted;
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
  plural(count, [singular, plural]) {
    return count === 1 ? singular : plural;
  },
  pluralWithCount(count, [singular, plural]) {
    return `${count} ${helpers.plural(count, [singular, plural])}`;
  },
  pluralBadge(count, [singular, plural], prefix = "") {
    return {
      text: prefix + count,
      postfix: helpers.plural(count, [singular, plural]),
    };
  },
  getHighchartsColors() {
    const Highcharts = require("highcharts");
    return Highcharts.getOptions().colors;
  },
  getModulesName(path) {
    const modules = path.split("node_modules/");
    const lastModule = modules[modules.length - 1];
    const [folder, subFolder] = lastModule.split("/");
    if (folder.startsWith("@")) {
      return `${folder}/${subFolder}`;
    }
    return folder;
  },
  getBestNetworkGraphSize(module, params) {
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
    module,
    { maxParentDepth = 2, omitVisitedModules = true } = {},
  ) {
    const queue = [{ module, parentId: "", level: 0 }];
    const visited = new Set();
    const result = [];
    let entryPointPath = null;
    const data = [];

    while (queue.length > 0) {
      const { module: currentModule, parentId, level } = queue.shift();

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

  getExtColor(extName) {
    const colors = {
      js: "#f1e05a50",
      ts: "#2b748950",
      tsx: "#2b748950",
      json: "#e34c2650",
      svg: "#e69f0d50",
      css: "#563d7c50",
      png: "#e44b2350",
    };
    return colors[extName] ?? colors["js"];
  },
  getFileExtension(filename) {
    const idx = filename.lastIndexOf(".");
    return idx === -1 ? "js" : filename.slice(idx + 1);
  },
  toFixed(value, fractionDigits = 2) {
    return Number(value).toFixed(fractionDigits);
  },
  percent(value, fractionDigits = 2) {
    return (100 * value).toFixed(fractionDigits) + "%";
  },
  formatBytes(bytes, decimals) {
    if (bytes == 0) return "0 Bytes";
    const k = 1024,
      dm = decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },
  isPackageImport(moduleName) {
    return moduleName?.[0] !== ".";
  },
  // isRuntimeCode(moduleName) {
  //   return (
  //     moduleName === "__prelude__" ||
  //     moduleName.includes("@babel/runtime") ||
  //     moduleName.includes("metro-runtime") ||
  //     moduleName.includes("@react-native/js-polyfills")
  //   );
  // },
  transformFilesList(files, rootFolder, type) {
    const nodeModulesMap = { children: {}, size: 0 };
    const sourceCodeMap = { children: {}, size: 0 };

    files.forEach(({ path, size }) => {
      if (path === "__prelude__") {
        path = "node_modules/__prelude__";
      }

      const shortPath = path.replace(rootFolder + "/", "");
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
        }

        current = current[part].children;
      });
    });

    if (type === "foamtree") {
      sumSizes(nodeModulesMap);
      sumSizes(sourceCodeMap);

      const sourceCodeGroup = toGroups(sourceCodeMap, "Source Code");
      const nodeModulesGroup = nodeModulesMap?.children?.node_modules
        ? toGroups(nodeModulesMap.children.node_modules, "node_modules")
        : {};

      if (!sourceCodeGroup.groups) {
        return nodeModulesGroup;
      }
      if (!nodeModulesGroup.groups) {
        return nodeModulesGroup;
      }

      const topLevelNode = { groups: [sourceCodeGroup, nodeModulesGroup] };
      topLevelNode.weight = topLevelNode.groups.reduce(
        (acc, group) => acc + group.weight,
        0,
      );

      return topLevelNode;
    }

    if (type === "highcharts-treemap") {
      const ROOT_ID_1 = "~";
      const ROOT_ID_2 = ".";
      return [
        { id: ROOT_ID_1, name: "node_modules" },
        { id: ROOT_ID_2, name: "Source Code" },
      ]
        .concat(flattenTree(nodeModulesMap.children.node_modules, ROOT_ID_1))
        .concat(flattenTree(sourceCodeMap, ROOT_ID_2));
    }

    throw new Error("Unsupported type: " + type);
  },
};

function flattenTree(
  node,
  parentId,
  prevWasSkipped = false,
  lvl = 0,
  result = [],
  overrideParentId,
) {
  const nodeChildrenCount = Object.keys(node.children);

  for (const key of nodeChildrenCount) {
    const childNode = node.children[key];
    const childId = parentId + "/" + key;
    const childrenCount = Object.keys(childNode.children).length;
    const hasChildren = childrenCount > 0;
    const item = {
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

function sumSizes(node) {
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

function toGroups(node, label) {
  const keys = Object.keys(node.children);

  const common = {
    label,
    weight: node.size,
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
    groups: keys.map((key) => toGroups(node.children[key], key)),
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const nm = "node_modules/";
function shortenPath(path, nodeModulesMap) {
  let index = path.lastIndexOf(nm);

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
      return nm + parentPackage + " ~ " + pathWithoutNestedNM.slice(nm.length);
    }

    return pathWithoutNestedNM;
  }
  return path;
}

module.exports = helpers;
