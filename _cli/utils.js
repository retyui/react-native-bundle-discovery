function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

function parseVersion(version) {
  if (typeof version !== "string") {
    return null;
  }

  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function isVersionGte(version, targetVersion) {
  const current = parseVersion(version);
  const target = parseVersion(targetVersion);

  if (!current || !target) {
    return false;
  }

  if (current.major !== target.major) {
    return current.major > target.major;
  }

  if (current.minor !== target.minor) {
    return current.minor > target.minor;
  }

  return current.patch >= target.patch;
}

// 0.87.1 -> 0.87
function formatRnVersionToDocsFormat(version) {
  return version.split(".").slice(0, 2).join(".");
}

module.exports = { formatBytes, isVersionGte, formatRnVersionToDocsFormat };
