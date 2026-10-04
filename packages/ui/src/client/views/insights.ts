import type helpers from "../queryHelpers";
import { card, escapeHTML, formatBytes, formatPercent, plural } from "./_html";

type Insights = ReturnType<typeof helpers.bundleInsights>;

function topList(
  title: string,
  items: { name: string; size: number; share: number; bar: number }[],
  page: "package" | "module",
  badge?: (item: Insights["topPackages"][number]) => string,
) {
  if (items.length === 0) return "";
  const rows = items
    .map(
      (item) => `
      <a class="in-row" href="${escapeHTML(discovery.encodePageHash(page, item.name))}">
        <span class="in-row-name" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}${
          badge ? badge(item as Insights["topPackages"][number]) : ""
        }</span>
        <span class="in-row-size">${formatBytes(item.size)}</span>
        <span class="in-row-share">${formatPercent(item.share)}</span>
        <span class="in-row-bar"><span style="width:${Math.max(item.bar * 100, 1).toFixed(2)}%"></span></span>
      </a>`,
    )
    .join("");
  return `
    <div class="in-top">
      <div class="mo-card-label">${title}</div>
      ${rows}
    </div>`;
}

function renderCards(o: Insights) {
  const savingsSub = !o.hasRecommendations
    ? "production report needed"
    : o.potentialSavings
      ? `${formatPercent(o.potentialSavingsShare)} of bundle · ${plural(o.findingsWithSavings, "fix", "fixes")}`
      : "nothing to remove";

  const cards = [
    card({
      label: "Bundle size",
      value: formatBytes(o.totalSize),
      sub: [o.platform, plural(o.modulesCount, "module")]
        .filter(Boolean)
        .join(" · "),
      kind: "accent",
    }),
    card({
      label: "Your code",
      value: formatBytes(o.sourceSize),
      sub: `${formatPercent(o.sourceShare)} of bundle · ${plural(o.ownModulesCount, "module")}`,
      bar: o.sourceShare,
    }),
    card({
      label: "node_modules",
      value: formatBytes(o.nodeModulesSize),
      sub: `${formatPercent(o.nodeModulesShare)} of bundle · ${plural(o.packagesCount, "package")}`,
      bar: o.nodeModulesShare,
    }),
    card({
      label: "Duplicates",
      value: plural(o.duplicatePackages, "package"),
      sub: `${plural(o.duplicateModules, "module")} with copies`,
      kind: o.duplicatePackages ? "danger" : "",
    }),
    card({
      label: "Potential savings",
      value: o.hasRecommendations ? `~${formatBytes(o.potentialSavings)}` : "–",
      sub: savingsSub,
      kind: o.potentialSavings ? "good" : "",
    }),
  ];

  return `<div class="mo-cards">${cards.join("")}</div>`;
}

function renderTopLists(o: Insights) {
  const copiesBadge = (pkg: Insights["topPackages"][number]) =>
    pkg.copies > 1
      ? ` <span class="mo-chip mo-chip-danger">×${pkg.copies}</span>`
      : "";
  return `
    <div class="in-tops">
      ${topList(
        `Heaviest packages · top 5 = ${formatPercent(o.topPackagesShare)} of bundle`,
        o.topPackages,
        "package",
        copiesBadge,
      )}
      ${topList("Heaviest modules in your code", o.topOwnModules, "module")}
    </div>`;
}

discovery.view.define("bundle-insights", (el, _config, data) => {
  const insights = data as Insights | null;
  if (!insights) return;
  (el as HTMLElement).innerHTML =
    renderCards(insights) + renderTopLists(insights);
});
