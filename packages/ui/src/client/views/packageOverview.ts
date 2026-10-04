import type helpers from "../queryHelpers";
import {
  card,
  chip,
  escapeHTML,
  formatBytes,
  formatPercent,
  plural,
} from "./_html";

type Overview = NonNullable<ReturnType<typeof helpers.packageOverview>>;

function formatDate(isoDate: string) {
  return new Date(isoDate).toISOString().slice(0, 10);
}

function externalChip(text: string, href: string) {
  return `<a class="mo-chip mo-chip-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${text} ↗</a>`;
}

function renderHeader(o: Overview) {
  // `name@version` when there is only one copy
  const id = o.versions.length === 1 ? `${o.name}@${o.versions[0]}` : o.name;
  const npmPath =
    o.versions.length === 1 ? `${o.name}/v/${o.versions[0]}` : o.name;

  const chips = [
    ...o.versions.map((version) => chip(`v${escapeHTML(version)}`, "pkg")),
    o.deprecated.length ? chip("Deprecated", "danger") : "",
    o.isOutdated && o.latestVersion
      ? chip(`Latest v${escapeHTML(o.latestVersion)}`, "warn")
      : "",
    o.copies.length > 1 ? chip(`Duplicated ×${o.copies.length}`, "danger") : "",
    ...o.findings.map((f) =>
      chip(
        `💡 ${escapeHTML(f.title)}`,
        "warn",
        discovery.encodePageHash("default", "insights"),
      ),
    ),
  ].join("");

  const links = [
    externalChip("npm", `https://www.npmjs.com/package/${npmPath}`),
    externalChip("bundlephobia", `https://bundlephobia.com/package/${id}`),
    externalChip("packagephobia", `https://packagephobia.com/result?p=${id}`),
    // Minified + gzipped size badge from bundlejs.com
    `<a class="po-badge" href="https://bundlejs.com/?q=${escapeHTML(id)}" target="_blank" rel="noopener noreferrer"><img alt="bundlejs size" src="https://deno.bundlejs.com/?q=${escapeHTML(id)}&badge=detailed" /></a>`,
  ].join("");

  return `
    <div class="mo-header">
      <span class="mo-ext po-icon">npm</span>
      <div class="mo-title">
        <div class="mo-dir">${o.paths.map(escapeHTML).join(" · ")}</div>
        <div class="mo-file">${escapeHTML(o.name)}</div>
        <div class="mo-chips">${chips}</div>
        <div class="mo-chips po-links">${links}</div>
      </div>
    </div>`;
}

function renderCards(o: Overview) {
  const otherPackages = o.importerPackages;
  const importers = [
    o.importedByOwnCode ? "your code" : "",
    otherPackages > 0 ? plural(otherPackages, "package") : "",
  ]
    .filter(Boolean)
    .join(" + ");

  const cards = [
    card({
      label: "Bundle size",
      value: formatBytes(o.size),
      sub: `${formatPercent(o.bundleShare)} of bundle · #${o.rank.toLocaleString()} of ${plural(o.packagesCount, "package")}`,
      kind: "accent",
      bar: o.largestShare,
    }),
    card({
      label: "Files",
      value: plural(o.filesCount, "module"),
      sub: `largest: ${escapeHTML(o.largestFile.slice(o.largestFile.lastIndexOf("/") + 1))} · ${formatBytes(o.largestFileSize)}`,
    }),
    o.copies.length > 1
      ? card({
          label: "Copies",
          value: plural(o.copies.length, "copy", "copies"),
          sub: `${formatBytes(o.copiesSavings)} could be saved`,
          kind: "danger",
        })
      : card({
          label: "Copies",
          value: "1 copy",
          sub: "bundled only once",
        }),
    card({
      label: "Imported by",
      value: plural(o.importedBy, "module"),
      sub: o.importedBy ? `from ${importers}` : "loaded by the bundler",
    }),
    o.publishedAt
      ? card({
          label: "Published",
          value: formatDate(o.publishedAt),
          sub: o.deprecated.length
            ? '<span class="mo-bad">deprecated</span>'
            : o.isOutdated && o.latestVersion
              ? `<span class="mo-bad">outdated</span> · latest v${escapeHTML(o.latestVersion)}`
              : '<span class="mo-good">latest version</span>',
          kind: o.deprecated.length ? "danger" : "",
        })
      : "",
  ];

  return `<div class="mo-cards">${cards.join("")}</div>`;
}

discovery.view.define("package-overview", (el, _config, data) => {
  const overview = data as Overview | null;
  if (!overview) return;
  (el as HTMLElement).innerHTML =
    renderHeader(overview) + renderCards(overview);
});
