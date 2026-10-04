import type helpers from "../queryHelpers";
import { card, escapeHTML, formatBytes, formatPercent, plural } from "./_html";

type Overview = NonNullable<ReturnType<typeof helpers.moduleOverview>>;

function chip(html: string, kind = "", href?: string) {
  const cls = `mo-chip${kind ? ` mo-chip-${kind}` : ""}`;
  return href
    ? `<a class="${cls}" href="${escapeHTML(href)}">${html}</a>`
    : `<span class="${cls}">${html}</span>`;
}

function renderHeader(o: Overview) {
  const chips = [
    o.pkg
      ? chip(
          `${escapeHTML(o.pkg.name)}${o.pkg.version ? ` <b>v${escapeHTML(o.pkg.version)}</b>` : ""}`,
          "pkg",
          discovery.encodePageHash("package", o.pkg.name),
        )
      : o.injectedBy
        ? ""
        : chip("Source code", "src"),
    o.injectedBy ? chip(`Injected by ${o.injectedBy}`, "warn") : "",
    o.pkg?.metadata?.deprecated ? chip("Deprecated", "danger") : "",
    o.pkg?.metadata && !o.pkg.metadata.isLatest && o.pkg.metadata.latestVersion
      ? chip(`Latest v${escapeHTML(o.pkg.metadata.latestVersion)}`, "warn")
      : "",
    o.isEntry ? chip("Entry point", "entry") : "",
    o.duplicates ? chip(`Duplicated ×${o.duplicates + 1}`, "danger") : "",
  ].join("");

  return `
    <div class="mo-header">
      <span class="mo-ext" style="background:${extColor(o.ext)}">${escapeHTML(o.ext)}</span>
      <div class="mo-title">
        <div class="mo-dir">${escapeHTML(o.dir)}</div>
        <div class="mo-file">${escapeHTML(o.file)}</div>
        <div class="mo-chips">${chips}</div>
      </div>
    </div>`;
}

// Same palette as `getExtColor` query helper, but opaque enough for a badge
function extColor(ext: string) {
  const colors: Record<string, string> = {
    js: "#f1e05a",
    ts: "#3178c6",
    tsx: "#3178c6",
    json: "#e34c26",
    svg: "#e69f0d",
    css: "#563d7c",
    png: "#e44b23",
  };
  return `${colors[ext] ?? colors.js}55`;
}

function renderCards(o: Overview) {
  const delta = o.sourceSize ? o.outputSize / o.sourceSize - 1 : 0;
  const deltaText =
    delta === 0
      ? "unchanged by transform"
      : delta < 0
        ? `<span class="mo-good">${formatPercent(-delta)} smaller</span> after transform`
        : `<span class="mo-bad">${formatPercent(delta)} larger</span> after transform`;

  const otherPackages = o.importerPackages - (o.importedByOwnCode ? 1 : 0);
  const importers = [
    o.importedByOwnCode ? "your code" : "",
    otherPackages > 0 ? plural(otherPackages, "package") : "",
  ]
    .filter(Boolean)
    .join(" + ");

  const cards = [
    card({
      label: "Output size",
      value: formatBytes(o.outputSize),
      sub: `${formatPercent(o.bundleShare)} of bundle · #${o.rank.toLocaleString()} of ${o.modulesCount.toLocaleString()}`,
      kind: "accent",
      bar: o.largestShare,
    }),
    card({
      label: "Source size",
      value: formatBytes(o.sourceSize),
      sub: o.sourceSize ? deltaText : undefined,
    }),
    card({
      label: "Source lines",
      value: o.sourceLines.toLocaleString(),
      sub:
        o.outputLines > 1
          ? `${plural(o.outputLines, "line")} after transform`
          : "minified to a single line",
    }),
    o.pkg
      ? card({
          label: "Share of package",
          value: formatPercent(o.pkg.share),
          sub: `of ${escapeHTML(o.pkg.name)} · ${formatBytes(o.pkg.size)} in ${plural(o.pkg.files, "file")}`,
          bar: o.pkg.share,
        })
      : "",
    card({
      label: "Imports",
      value: plural(o.imports.length, "module"),
      sub: o.missingImports
        ? `${o.missingImports} not in the bundle`
        : o.imports.length
          ? "direct dependencies"
          : "no dependencies",
    }),
    card({
      label: "Imported by",
      value: plural(o.importedBy, "module"),
      sub: o.importedBy
        ? `from ${importers}`
        : o.isEntry
          ? "entry point"
          : o.injectedBy
            ? `loaded by ${o.injectedBy}`
            : "nothing imports it",
    }),
    o.duplicates
      ? card({
          label: "Duplicates",
          value: plural(o.duplicates, "copy", "copies"),
          sub: `${formatBytes(o.duplicatesSize)} could be saved`,
          kind: "danger",
        })
      : "",
  ];

  return `<div class="mo-cards">${cards.join("")}</div>`;
}

discovery.view.define("module-overview", (el, _config, data) => {
  const overview = data as Overview | null;
  if (!overview) return;
  (el as HTMLElement).innerHTML =
    renderHeader(overview) + renderCards(overview);
});
