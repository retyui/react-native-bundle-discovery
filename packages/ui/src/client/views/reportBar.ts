import type helpers from "../queryHelpers";
import { escapeHTML, formatBytes, formatPercent } from "./_html";

type Summary = ReturnType<typeof helpers.reportSummary>;

const PLATFORM_NAMES: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  macos: "macOS",
  windows: "Windows",
};

function platformName(platform: string) {
  return (
    PLATFORM_NAMES[platform] ??
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
}

function chip(text: string, kind: string, title?: string) {
  const titleAttr = title ? ` title="${escapeHTML(title)}"` : "";
  return `<span class="rb-chip rb-chip-${kind}"${titleAttr}>${text}</span>`;
}

// Only a wrong build setup is loud: it makes every size in the report misleading
function renderBuild(s: Summary) {
  const chips = [
    s.platform ? chip(escapeHTML(platformName(s.platform)), "platform") : "",
  ];
  if (s.dev === true) {
    chips.push(
      chip(
        "⚠ Dev bundle",
        "warn",
        "__DEV__ is true: the bundle has dev-only code, so sizes are bigger than in production. Build with --dev false.",
      ),
    );
  } else if (s.dev === false) {
    chips.push(chip("Production", "ok", "__DEV__: false"));
  }
  if (s.minify === false) {
    chips.push(
      chip(
        "⚠ Not minified",
        "warn",
        "Minify is off: sizes are bigger than in a release build. Build with --minify true.",
      ),
    );
  } else if (s.minify === true) {
    chips.push(chip("Minified", "ok", "Minify: true"));
  }
  return `<div class="rb-build">${chips.join("")}</div>`;
}

function renderSize(s: Summary) {
  const sourceShare = s.totalSize ? s.sourceSize / s.totalSize : 0;
  const nodeModulesShare = s.totalSize ? s.nodeModulesSize / s.totalSize : 0;
  const title = `Your code: ${formatBytes(s.sourceSize)}\nnode_modules: ${formatBytes(s.nodeModulesSize)}`;
  return `
    <div class="rb-size" title="${escapeHTML(title)}">
      <b class="rb-total">${formatBytes(s.totalSize)}</b>
      <span class="rb-split">
        <span class="rb-split-own" style="width:${(sourceShare * 100).toFixed(2)}%"></span>
        <span class="rb-split-nm" style="width:${(nodeModulesShare * 100).toFixed(2)}%"></span>
      </span>
      <span class="rb-legend">
        <span><i class="rb-dot rb-dot-own"></i>Your code ${formatPercent(sourceShare)}</span>
        <span><i class="rb-dot rb-dot-nm"></i>node_modules ${formatPercent(nodeModulesShare)}</span>
      </span>
    </div>`;
}

function renderDate(s: Summary) {
  if (!s.date) return "";
  const date = new Date(s.date);
  if (Number.isNaN(date.getTime())) return "";
  // "Sep 5, 20:08", the year only when it is not the current one
  const text = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `<div class="rb-date" title="${escapeHTML(date.toISOString())}">Built ${escapeHTML(text)}</div>`;
}

discovery.view.define("report-bar", (el, _config, data) => {
  const summary = data as Summary | null;
  if (!summary) return;
  (el as HTMLElement).innerHTML =
    renderBuild(summary) + renderSize(summary) + renderDate(summary);
});
