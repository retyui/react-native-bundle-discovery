export function getReactNativeVersion(
  packages:
    | ReadonlyArray<{ name?: string; version?: string } | null>
    | undefined,
): string | undefined {
  if (!Array.isArray(packages)) {
    return undefined;
  }

  return packages.find((pkg) => pkg?.name === "react-native")?.version;
}

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: unknown): ParsedVersion | null {
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

export function isVersionGte(
  version: string | undefined,
  targetVersion: string,
): boolean {
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
export function formatRnVersionToDocsFormat(version: string): string {
  return version.split(".").slice(0, 2).join(".");
}
