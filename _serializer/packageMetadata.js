const DEFAULT_REGISTRY = "https://registry.npmjs.org";
const DEFAULT_TIMEOUT_MS = 1_000;
const DEFAULT_CONCURRENCY = 8;

// Simple in-memory cache: `${registry}|${name}` -> Promise<packument summary | null>
// Keeps promises (not values) so concurrent lookups of the same package share one request,
// and different versions of the same package share one packument.
const cache = new Map();

/**
 * `@babel/runtime` -> `@babel%2fruntime`
 */
function encodePackageName(name) {
  return name.startsWith("@") ? `@${encodeURIComponent(name.slice(1))}` : name;
}

async function fetchJson(url, timeoutMs) {
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
  return res.json();
}

/**
 * The version manifest (`/<name>/<version>`) has no publish date,
 * so the packument is fetched once and only the fields we need are kept.
 */
async function fetchPackageSummary(name, { registry, timeoutMs }) {
  const packument = await fetchJson(
    `${registry}/${encodePackageName(name)}`,
    timeoutMs,
  );

  if (!packument) {
    return null;
  }

  const versions = {};
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

function getPackageSummary(name, { registry, timeoutMs }) {
  const key = `${registry}|${name}`;

  if (!cache.has(key)) {
    const promise = fetchPackageSummary(name, { registry, timeoutMs }).catch(
      (error) => {
        // Don't cache failures (network issues, timeouts), retry on next report
        cache.delete(key);
        throw error;
      },
    );
    cache.set(key, promise);
  }

  return cache.get(key);
}

/**
 * Returns metadata of a specific (installed) package version, not the latest one.
 *
 * @returns {Promise<{createdAt: string|null, deprecated: string|false, isLatest: boolean, latestVersion: string|null} | null>}
 *   `null` when the package/version is not found in the registry.
 */
async function getPackageMetadata(
  name,
  version,
  { registry = DEFAULT_REGISTRY, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const summary = await getPackageSummary(name, { registry, timeoutMs });
  const info = summary?.versions[version];

  if (!info) {
    return null;
  }

  return {
    createdAt: info.createdAt,
    deprecated: info.deprecated,
    isLatest: summary.latestVersion === version,
    latestVersion: summary.latestVersion,
  };
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
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

/**
 * Adds a `metadata` field to every package of the report.
 * Failed lookups result in `metadata: null` and are passed to `onError`.
 *
 * @param {Array<{name: string, version: string}>} packages
 */
async function withPackagesMetadata(
  packages,
  {
    registry = DEFAULT_REGISTRY,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    concurrency = DEFAULT_CONCURRENCY,
    onError = () => {},
  } = {},
) {
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
      onError(error, pkg);
      return { ...pkg, metadata: null };
    }
  });
}

module.exports = {
  getPackageMetadata,
  withPackagesMetadata,
};
