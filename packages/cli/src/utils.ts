import type { ByteLimit, SizeLimit } from "./types";

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

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

const SIZE_UNITS: Record<string, number> = {
  b: 1,
  k: 1024,
  kb: 1024,
  m: 1024 ** 2,
  mb: 1024 ** 2,
  g: 1024 ** 3,
  gb: 1024 ** 3,
};

// "50KB" | "0.5mb" | "51200" -> bytes, "5%" -> { percent: 5 }, invalid -> null
export function parseSizeLimit(value: unknown): ByteLimit | null;
export function parseSizeLimit(
  value: unknown,
  options: { allowPercent?: boolean },
): SizeLimit | null;
export function parseSizeLimit(
  value: unknown,
  { allowPercent = false }: { allowPercent?: boolean } = {},
): SizeLimit | null {
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
export function formatRnVersionToDocsFormat(version: string): string {
  return version.split(".").slice(0, 2).join(".");
}
