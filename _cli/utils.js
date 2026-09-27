function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

function getReactNativeVersion(packages) {
  if (!Array.isArray(packages)) {
    return undefined;
  }

  return packages.find((pkg) => pkg?.name === "react-native")?.version;
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

const SIZE_UNITS = {
  b: 1,
  k: 1024,
  kb: 1024,
  m: 1024 ** 2,
  mb: 1024 ** 2,
  g: 1024 ** 3,
  gb: 1024 ** 3,
};

// "50KB" | "0.5mb" | "51200" -> bytes, "5%" -> { percent: 5 }, invalid -> null
function parseSizeLimit(value, { allowPercent = false } = {}) {
  const text = String(value).trim().toLowerCase().replace(/\s+/g, "");

  const percentMatch = text.match(/^(\d+(?:\.\d+)?)%$/);
  if (percentMatch) {
    return allowPercent ? { percent: Number(percentMatch[1]) } : null;
  }

  const sizeMatch = text.match(/^(\d+(?:\.\d+)?)([a-z]*)$/);
  if (!sizeMatch) {
    return null;
  }

  const multiplier = sizeMatch[2] ? SIZE_UNITS[sizeMatch[2]] : 1;
  if (!multiplier) {
    return null;
  }

  return { bytes: Math.round(Number(sizeMatch[1]) * multiplier) };
}

// 0.87.1 -> 0.87
function formatRnVersionToDocsFormat(version) {
  return version.split(".").slice(0, 2).join(".");
}

module.exports = {
  formatBytes,
  getReactNativeVersion,
  isVersionGte,
  formatRnVersionToDocsFormat,
  parseSizeLimit,
};
