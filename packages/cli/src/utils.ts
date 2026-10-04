import type { ByteLimit, SizeLimit } from "./types";

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
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
