import type {
  Comparison,
  ModuleChange,
  ModuleSizeChange,
  NewDuplicate,
  PackageByName,
  PackageVersionChange,
} from "@react-native-bundle-discovery/shared";
import { card, chip, escapeHTML, formatBytes, plural } from "./_html";

interface CompareViewData {
  comparison: Comparison & { beforeFile: string };
  /** Paths of the "after" modules (module page ids) */
  modulePaths: string[];
}

const ROWS_LIMIT = 10;

function formatDelta(bytes: number) {
  if (bytes === 0) return "0 B";
  return `${bytes > 0 ? "+" : "−"}${formatBytes(Math.abs(bytes))}`;
}

function deltaHTML(bytes: number) {
  const cls = bytes > 0 ? "mo-bad" : bytes < 0 ? "mo-good" : "";
  return `<span class="${cls}">${formatDelta(bytes)}</span>`;
}

// "▼ 548 · 9.4%" pill (red when grows, green when shrinks) + "from 5,846"
function change(delta: number, amount: string, before: number, from: string) {
  const percent = before
    ? ` · ${((Math.abs(delta) / before) * 100).toFixed(2)}%`
    : "";
  const pill =
    delta === 0
      ? `<span class="cmp-pill">= no change</span>`
      : `<span class="cmp-pill cmp-pill-${delta > 0 ? "up" : "down"}">${delta > 0 ? "▲" : "▼"} ${amount}${percent}</span>`;
  return `<span class="cmp-change">${pill}<span class="cmp-from">from ${from}</span></span>`;
}

function countChange(before: number, after: number) {
  const delta = after - before;
  return change(
    delta,
    Math.abs(delta).toLocaleString(),
    before,
    before.toLocaleString(),
  );
}

interface Row {
  name: string;
  href?: string | null;
  badge?: string;
  detail?: string;
  delta: number;
}

function row({ name, href, badge = "", detail = "", delta }: Row) {
  const tag = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeHTML(href)}"` : "";
  return `
    <${tag} class="cmp-row"${hrefAttr}>
      <span class="cmp-row-name" title="${escapeHTML(name)}">${escapeHTML(name)}${badge}</span>
      <span class="cmp-row-detail">${detail}</span>
      <span class="cmp-row-delta">${deltaHTML(delta)}</span>
    </${tag}>`;
}

function section(title: string, total: string, rows: string[]) {
  if (rows.length === 0) return "";
  const visible = rows.slice(0, ROWS_LIMIT).join("");
  const hidden = rows.slice(ROWS_LIMIT).join("");
  return `
    <div class="in-top cmp-section">
      <div class="mo-card-label">${title} · ${total}</div>
      ${visible}
      ${
        hidden
          ? `<div class="cmp-more" hidden>${hidden}</div>
             <button type="button" class="cmp-more-btn">Show ${rows.length - ROWS_LIMIT} more</button>`
          : ""
      }
    </div>`;
}

function sumDelta(items: { deltaInBytes: number }[]) {
  return items.reduce((sum, item) => sum + item.deltaInBytes, 0);
}

function renderCards({ summary, packages }: Comparison) {
  const { before, after, deltaInBytes } = summary;
  const cards = [
    card({
      label: "Bundle size",
      value: formatBytes(after.sizeInBytes),
      sub: change(
        deltaInBytes,
        formatBytes(Math.abs(deltaInBytes)),
        before.sizeInBytes,
        formatBytes(before.sizeInBytes),
      ),
      kind: deltaInBytes > 0 ? "danger" : deltaInBytes < 0 ? "good" : "accent",
    }),
    card({
      label: "Modules",
      value: after.modules.toLocaleString(),
      sub: countChange(before.modules, after.modules),
    }),
    card({
      label: "Packages",
      value: after.packages.toLocaleString(),
      sub: countChange(before.packages, after.packages),
    }),
    card({
      label: "New duplicates",
      value: plural(packages.newDuplicates.length, "package"),
      sub: "packages bundled more times than before",
      kind: packages.newDuplicates.length ? "danger" : "",
    }),
    card({
      label: "New deprecated",
      value: plural(packages.deprecated.added.length, "package"),
      sub: countChange(
        packages.deprecated.beforeCount,
        packages.deprecated.afterCount,
      ),
      kind: packages.deprecated.added.length ? "danger" : "",
    }),
  ];
  return `<div class="mo-cards">${cards.join("")}</div>`;
}

function renderWarnings({ transformOptionsDiff, summary }: Comparison) {
  const items = transformOptionsDiff.map(
    ({ option, before, after }) =>
      `<b>${escapeHTML(option)}</b>: ${escapeHTML(before)} → ${escapeHTML(after)}`,
  );
  if (summary.before.platform !== summary.after.platform) {
    items.unshift(
      `<b>platform</b>: ${escapeHTML(summary.before.platform)} → ${escapeHTML(summary.after.platform)}`,
    );
  }
  if (items.length === 0) return "";
  return `
    <div class="cmp-warning">
      ⚠️ The reports were built with different options, so sizes are not directly comparable: ${items.join(", ")}
    </div>`;
}

function render({ comparison: c, modulePaths }: CompareViewData) {
  const paths = new Set(modulePaths);
  const moduleHref = (path: string) =>
    paths.has(path) ? discovery.encodePageHash("module", path) : null;
  const packageHref = (name: string) =>
    discovery.encodePageHash("package", name);
  const versions = (list: string[]) => escapeHTML(list.join(", "));

  const contributors = c.biggestContributors.map((item) =>
    row({
      name: item.name,
      detail: item.note ? escapeHTML(item.note) : "",
      delta: item.deltaInBytes,
    }),
  );

  const versionChanges = c.packages.versionChanges.map(
    (pkg: PackageVersionChange) =>
      row({
        name: pkg.name,
        href: packageHref(pkg.name),
        detail: `${versions(pkg.beforeVersions)} → ${versions(pkg.afterVersions)}`,
        delta: pkg.deltaInBytes,
      }),
  );
  const addedPackages = c.packages.added.map((pkg: PackageByName) =>
    row({
      name: pkg.name,
      href: packageHref(pkg.name),
      detail: versions(pkg.versions),
      delta: pkg.sizeInBytes,
    }),
  );
  const removedPackages = c.packages.removed.map((pkg: PackageByName) =>
    row({
      name: pkg.name,
      detail: versions(pkg.versions),
      delta: -pkg.sizeInBytes,
    }),
  );
  const newDuplicates = c.packages.newDuplicates.map((dup: NewDuplicate) =>
    row({
      name: dup.name,
      href: packageHref(dup.name),
      badge: ` ${chip(`×${dup.count}`, "danger")}`,
      detail: escapeHTML(dup.entries.map((entry) => entry.version).join(", ")),
      delta: dup.sizeInBytes,
    }),
  );
  const newDeprecated = c.packages.deprecated.added.map((pkg) => {
    // `id` is `name@version`
    const name = pkg.id.slice(0, pkg.id.lastIndexOf("@"));
    return row({
      name: pkg.id,
      href: packageHref(name),
      badge: ` ${chip("deprecated", "warn")}`,
      detail: escapeHTML(pkg.reason ?? ""),
      delta: 0,
    });
  });

  const addedModules = c.modules.added.map((m: ModuleSizeChange) =>
    row({ name: m.path, href: moduleHref(m.path), delta: m.deltaInBytes }),
  );
  const removedModules = c.modules.removed.map((m: ModuleSizeChange) =>
    row({ name: m.path, delta: m.deltaInBytes }),
  );
  const changedModules = c.modules.changed.map((m: ModuleChange) =>
    row({
      name: m.path,
      href: paths.has(m.path)
        ? discovery.encodePageHash("module-diff", m.path)
        : null,
      detail: `${formatBytes(m.beforeSizeInBytes)} → ${formatBytes(m.afterSizeInBytes)}`,
      delta: m.deltaInBytes,
    }),
  );

  const hasChanges =
    c.summary.deltaInBytes !== 0 ||
    c.modules.added.length +
      c.modules.removed.length +
      c.modules.changed.length >
      0 ||
    c.packages.versionChanges.length +
      c.packages.added.length +
      c.packages.removed.length >
      0;

  return `
    <div class="cmp-title">
      Compared with ${chip(escapeHTML(c.beforeFile))}
    </div>
    ${renderWarnings(c)}
    ${renderCards(c)}
    ${
      hasChanges
        ? ""
        : `<div class="dup-empty cmp-empty">✅ No differences between the reports</div>`
    }
    <div class="cmp-sections">
      ${section("Biggest growth", "by package / folder", contributors)}
      ${section("Package version changes", plural(versionChanges.length, "package"), versionChanges)}
      ${section("New duplicates", plural(newDuplicates.length, "package"), newDuplicates)}
      ${section("New deprecated packages", plural(newDeprecated.length, "package"), newDeprecated)}
      ${section("Added packages", `${plural(addedPackages.length, "package")} · ${formatDelta(c.packages.added.reduce((sum, pkg) => sum + pkg.sizeInBytes, 0))}`, addedPackages)}
      ${section("Removed packages", `${plural(removedPackages.length, "package")} · ${formatDelta(-c.packages.removed.reduce((sum, pkg) => sum + pkg.sizeInBytes, 0))}`, removedPackages)}
      ${section("Added modules", `${plural(addedModules.length, "module")} · ${formatDelta(sumDelta(c.modules.added))}`, addedModules)}
      ${section("Removed modules", `${plural(removedModules.length, "module")} · ${formatDelta(sumDelta(c.modules.removed))}`, removedModules)}
      ${section("Changed modules", `${plural(changedModules.length, "module")} · net ${formatDelta(sumDelta(c.modules.changed))}`, changedModules)}
    </div>`;
}

discovery.view.define("bundle-compare", (el, _config, data) => {
  const viewData = data as CompareViewData | null;
  if (!viewData?.comparison) return;
  const root = el as HTMLElement;
  root.innerHTML = render(viewData);
  root.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest(".cmp-more-btn");
    if (!button) return;
    button.previousElementSibling?.removeAttribute("hidden");
    button.remove();
  });
});
