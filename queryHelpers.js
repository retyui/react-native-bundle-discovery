const Highcharts = require("highcharts");

const helpers = {
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

      const isNodeModule = shortPath.includes("node_modules");

      const parts = shortenPath(shortPath).split("/");
      let current = (isNodeModule ? nodeModulesMap : sourceCodeMap).children;

      parts.forEach((part, index) => {
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

      const groups = {
        groups: [
          toGroups(sourceCodeMap, "Source Code"),
          toGroups(nodeModulesMap.children.node_modules, "node_modules"),
        ],
      };

      groups.weight = groups.groups.reduce(
        (acc, group) => acc + group.weight,
        0,
      );

      return groups;
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
  let totalSize = node.size || 0;
  for (const key in node.children) {
    totalSize += sumSizes(node.children[key]);
  }
  node.size = totalSize;
  return totalSize;
}

function toGroups(node, label) {
  const keys = Object.keys(node.children);
  if (keys.length === 0) {
    return { label, weight: node.size, size: helpers.formatBytes(node.size) };
  }

  return {
    label,
    weight: node.size,
    size: helpers.formatBytes(node.size),
    groups: keys.map((key) => toGroups(node.children[key], key)),
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shortenPath(path) {
  let index = path.lastIndexOf("node_modules/");
  return index > 0 ? path.slice(index) : path;
}

module.exports = helpers;
