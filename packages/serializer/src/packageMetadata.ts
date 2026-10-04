import type { PackageMetadata } from "./types";

const DEFAULT_REGISTRY = "https://registry.npmjs.org";
const DEFAULT_TIMEOUT_MS = 6_000;
const DEFAULT_CONCURRENCY = 4;

interface Packument {
  "dist-tags"?: Record<string, string>;
  time?: Record<string, string>;
  versions?: Record<string, { deprecated?: string }>;
}

interface VersionSummary {
  createdAt: string | null;
  deprecated: string | false;
}

interface PackageSummary {
  latestVersion: string | null;
  versions: Record<string, VersionSummary>;
}

interface RegistryOptions {
  registry: string;
  timeoutMs: number;
}

// Simple in-memory cache: `${registry}|${name}` -> Promise<packument summary | null>
// Keeps promises (not values) so concurrent lookups of the same package share one request,
// and different versions of the same package share one packument.
const cache = new Map<string, Promise<PackageSummary | null>>();

/**
 * `@babel/runtime` -> `@babel%2fruntime`
 */
function encodePackageName(name: string): string {
  return name.startsWith("@") ? `@${encodeURIComponent(name.slice(1))}` : name;
}

async function fetchJson<T>(url: string, timeoutMs: number): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} (${url})`);
  }
  return res.json() as Promise<T>;
}

/**
 * The version manifest (`/<name>/<version>`) has no publish date,
 * so the packument is fetched once and only the fields we need are kept.
 */
async function fetchPackageSummary(
  name: string,
  { registry, timeoutMs }: RegistryOptions,
): Promise<PackageSummary | null> {
  const packument = await fetchJson<Packument>(
    `${registry}/${encodePackageName(name)}`,
    timeoutMs,
  );

  if (!packument) {
    return null;
  }

  const versions: Record<string, VersionSummary> = {};
  for (const [version, manifest] of Object.entries(packument.versions ?? {})) {
    versions[version] = {
      createdAt: packument.time?.[version] ?? null,
      deprecated: manifest.deprecated || false,
    };
  }

  return {
    latestVersion: packument["dist-tags"]?.latest ?? null,
    versions,
  };
}

function getPackageSummary(
  name: string,
  { registry, timeoutMs }: RegistryOptions,
): Promise<PackageSummary | null> {
  const key = `${registry}|${name}`;

  let promise = cache.get(key);
  if (!promise) {
    promise = fetchPackageSummary(name, { registry, timeoutMs }).catch(
      (error: unknown) => {
        // Don't cache failures (network issues, timeouts), retry on next report
        cache.delete(key);
        throw error;
      },
    );
    cache.set(key, promise);
  }

  return promise;
}

/**
 * Returns metadata of a specific (installed) package version, not the latest one.
 *
 * @returns `null` when the package/version is not found in the registry.
 */
export async function getPackageMetadata(
  name: string,
  version: string,
  {
    registry = DEFAULT_REGISTRY,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: Partial<RegistryOptions> = {},
): Promise<PackageMetadata | null> {
  const summary = await getPackageSummary(name, { registry, timeoutMs });
  const info = summary?.versions[version];

  if (!summary || !info) {
    return null;
  }

  return {
    createdAt: info.createdAt,
    deprecated: info.deprecated,
    isLatest: summary.latestVersion === version,
    latestVersion: summary.latestVersion,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
}

interface WithPackagesMetadataOptions<T> extends Partial<RegistryOptions> {
  concurrency?: number;
  onError?: (error: Error, pkg: T) => void;
}

/**
 * Adds a `metadata` field to every package of the report.
 * Failed lookups result in `metadata: null` and are passed to `onError`.
 */
export async function withPackagesMetadata<
  T extends { name: string; version: string },
>(
  packages: T[],
  {
    registry = DEFAULT_REGISTRY,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    concurrency = DEFAULT_CONCURRENCY,
    onError = () => {},
  }: WithPackagesMetadataOptions<T> = {},
): Promise<Array<T & { metadata: PackageMetadata | null }>> {
  return mapWithConcurrency(packages, concurrency, async (pkg) => {
    if (!pkg.version) {
      return { ...pkg, metadata: null };
    }
    try {
      const metadata = await getPackageMetadata(pkg.name, pkg.version, {
        registry,
        timeoutMs,
      });
      return { ...pkg, metadata };
    } catch (error) {
      onError(error as Error, pkg);
      return { ...pkg, metadata: null };
    }
  });
}

/**
 * Keeps the Node.js process alive until the returned `release` is called
 * or `maxMs` elapses, whichever comes first
 */
export function keepProcessAlive(maxMs = 30_000): () => void {
  const keepAlive = setInterval(() => {}, 1000);
  const timeout = setTimeout(() => clearInterval(keepAlive), maxMs);
  // The timeout itself must not keep the process alive
  timeout.unref();

  return () => {
    clearInterval(keepAlive);
    clearTimeout(timeout);
  };
}
