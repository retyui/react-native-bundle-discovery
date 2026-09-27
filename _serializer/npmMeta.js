const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

const chalk = require("chalk");
const NAME = require("./package.json").name;

const CACHE_VERSION = 1;
const DEFAULT_REGISTRY = "https://registry.npmjs.org";
const DAY = 24 * 60 * 60 * 1000;

const DEFAULT_OPTIONS = {
  registry: DEFAULT_REGISTRY,
  // A global (per-user) cache shared by all projects on the machine
  cacheDir: null,
  // How long `latest` dist-tag and "not found" answers stay fresh.
  // Version manifests are immutable on npm and never expire.
  ttl: DAY,
  timeout: 10_000,
  concurrency: 16,
  silent: false,
};

function getDefaultCacheDir() {
  if (process.env.RN_BUNDLE_DISCOVERY_CACHE_DIR) {
    return process.env.RN_BUNDLE_DISCOVERY_CACHE_DIR;
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Caches", NAME);
  }
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, NAME, "Cache");
  }
  const xdg = process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
  return path.join(xdg, NAME);
}

function readCache(cacheFile) {
  try {
    const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    if (cache?.version === CACHE_VERSION && cache.entries) {
      return cache;
    }
  } catch {
    // Missing or corrupted cache -> start from scratch
  }
  return { version: CACHE_VERSION, entries: {} };
}

function writeCache(cacheFile, cache) {
  try {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    // Merge with what other processes (e.g. parallel ios/android builds) may have written meanwhile
    const onDisk = readCache(cacheFile);
    const merged = {
      version: CACHE_VERSION,
      entries: { ...onDisk.entries, ...cache.entries },
    };
    // Atomic write: never leave a half-written cache file behind
    const tmpFile = `${cacheFile}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(merged));
    fs.renameSync(tmpFile, cacheFile);
  } catch {
    // Cache is best-effort: a read-only FS must not break the build
  }
}

function encodePackageName(name) {
  // `@scope/name` -> `@scope%2Fname`
  return name.startsWith("@")
    ? `@${encodeURIComponent(name.slice(1))}`
    : encodeURIComponent(name);
}

async function fetchJson(url, timeout) {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(timeout),
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

function getRepositoryUrl(repository) {
  const url = typeof repository === "string" ? repository : repository?.url;
  if (!url) {
    return null;
  }
  return url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/^github:/, "https://github.com/")
    .replace(/\.git$/, "");
}

function getAuthorName(author) {
  return typeof author === "string" ? author : (author?.name ?? null);
}

/**
 * Keep only fields that are useful for bundle analysis, the whole manifest is too big
 */
function pickVersionMeta(manifest) {
  return {
    description: manifest.description ?? null,
    license:
      (typeof manifest.license === "string"
        ? manifest.license
        : manifest.license?.type) ?? null,
    homepage: manifest.homepage ?? null,
    repository: getRepositoryUrl(manifest.repository),
    author: getAuthorName(manifest.author),
    deprecated: manifest.deprecated ?? null,
    sideEffects: manifest.sideEffects ?? null,
    hasTypes: Boolean(manifest.types || manifest.typings),
    unpackedSize: manifest.dist?.unpackedSize ?? null,
    fileCount: manifest.dist?.fileCount ?? null,
    dependenciesCount: Object.keys(manifest.dependencies ?? {}).length,
  };
}

async function runWithConcurrency(items, concurrency, fn) {
  let index = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const item = items[index++];
        await fn(item);
      }
    },
  );
  await Promise.all(workers);
}

/**
 * Fetches npm registry metadata for the given packages, using a global on-disk cache.
 *
 * Cache layout (`<cacheDir>/npm-meta.json`):
 *   - `v:<name>@<version>` -> version manifest subset (immutable, never expires)
 *   - `l:<name>`           -> latest version (expires after `ttl`)
 *
 * @param {{name: string, version: string}[]} packages
 * @param {Partial<typeof DEFAULT_OPTIONS>} [options]
 * @returns {Promise<Map<string, object | null>>} `<name>@<version>` -> meta (`null` when not published on the registry)
 */
async function fetchPackagesMeta(packages, options = {}) {
  const { registry, cacheDir, ttl, timeout, concurrency, silent } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const registryUrl = registry.replace(/\/+$/, "");
  const cacheFile = path.join(
    cacheDir || getDefaultCacheDir(),
    "npm-meta.json",
  );
  // Different registries may serve different packages with the same name
  const cachePrefix = registryUrl === DEFAULT_REGISTRY ? "" : `${registryUrl}|`;

  const cache = readCache(cacheFile);
  const now = Date.now();
  let cacheChanged = false;
  let failedRequests = 0;

  const getCached = (key, withTtl) => {
    const entry = cache.entries[cachePrefix + key];
    if (!entry) return undefined;
    if (withTtl && now - entry.fetchedAt > ttl) return undefined;
    return entry.data;
  };
  const setCached = (key, data) => {
    cache.entries[cachePrefix + key] = { fetchedAt: now, data };
    cacheChanged = true;
  };

  const request = async (url) => {
    try {
      return { ok: true, data: await fetchJson(url, timeout) };
    } catch {
      failedRequests++;
      return { ok: false, data: null };
    }
  };

  const unique = new Map();
  for (const pkg of packages) {
    if (pkg.name && pkg.version) {
      unique.set(`${pkg.name}@${pkg.version}`, pkg);
    }
  }
  const names = [...new Set([...unique.values()].map((pkg) => pkg.name))];

  // 1. Latest versions (one request per package name)
  const latest = new Map();
  await runWithConcurrency(names, concurrency, async (name) => {
    const key = `l:${name}`;
    let data = getCached(key, true);
    if (data === undefined) {
      const res = await request(
        `${registryUrl}/${encodePackageName(name)}/latest`,
      );
      if (!res.ok) return;
      data = res.data?.version ?? null;
      setCached(key, data);
    }
    latest.set(name, data);
  });

  // 2. Version specific manifests (one request per name@version)
  const result = new Map();
  await runWithConcurrency(
    [...unique.values()],
    concurrency,
    async ({ name, version }) => {
      const id = `${name}@${version}`;
      const key = `v:${id}`;
      // Unpublished versions (private/local packages) may get published later, so they respect ttl
      let data = getCached(key, false);
      if (data === null) {
        data = getCached(key, true);
      }
      if (data === undefined) {
        // Package itself isn't on the registry -> no need to request the version
        if (latest.has(name) && latest.get(name) === null) {
          data = null;
        } else {
          const res = await request(
            `${registryUrl}/${encodePackageName(name)}/${encodeURIComponent(version)}`,
          );
          if (!res.ok) return;
          data = res.data ? pickVersionMeta(res.data) : null;
        }
        setCached(key, data);
      }

      const latestVersion = latest.get(name) ?? null;
      result.set(
        id,
        data && {
          ...data,
          latestVersion,
          isLatest: latestVersion ? latestVersion === version : null,
          npmUrl: `https://www.npmjs.com/package/${name}/v/${version}`,
        },
      );
    },
  );

  if (cacheChanged) {
    writeCache(cacheFile, cache);
  }

  if (failedRequests > 0 && !silent) {
    console.warn(
      `${chalk.yellow(`[${NAME}]`)}: Failed to fetch npm metadata (${failedRequests} requests), some packages will have no \`meta\``,
    );
  }

  return result;
}

/**
 * Adds `meta` prop (npm registry info) to each package, never throws
 */
async function addNpmMetaToPackages(packages, options) {
  if (typeof fetch !== "function") {
    return packages;
  }
  try {
    const metaMap = await fetchPackagesMeta(packages, options);
    return packages.map((pkg) => ({
      ...pkg,
      meta: metaMap.get(`${pkg.name}@${pkg.version}`) ?? null,
    }));
  } catch (e) {
    if (!options?.silent) {
      console.warn(
        `${chalk.yellow(`[${NAME}]`)}: Failed to add npm metadata: ${e?.message}`,
      );
    }
    return packages;
  }
}

module.exports = {
  fetchPackagesMeta,
  addNpmMetaToPackages,
  getDefaultCacheDir,
};
