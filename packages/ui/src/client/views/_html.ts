// HTML building blocks shared by the custom views (module page, insights)

export function escapeHTML(str: unknown) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${Number.parseFloat((bytes / 1024 ** i).toFixed(i ? 1 : 0))} ${units[i]}`;
}

export function formatPercent(value: number) {
  const pct = value * 100;
  if (pct === 0) return "0%";
  if (pct < 0.01) return "<0.01%";
  return `${pct < 10 ? pct.toFixed(2) : pct.toFixed(1)}%`;
}

export function plural(
  count: number,
  singular: string,
  pluralForm = `${singular}s`,
) {
  return `${count.toLocaleString()} ${count === 1 ? singular : pluralForm}`;
}

export function card({
  label,
  value,
  sub,
  kind = "",
  bar,
}: {
  label: string;
  value: string;
  sub?: string;
  kind?: string;
  bar?: number;
}) {
  return `
    <div class="mo-card${kind ? ` mo-card-${kind}` : ""}">
      <div class="mo-card-label">${label}</div>
      <div class="mo-card-value">${value}</div>
      ${sub ? `<div class="mo-card-sub">${sub}</div>` : ""}
      ${
        bar === undefined
          ? ""
          : `<div class="mo-bar"><div style="width:${Math.max(bar * 100, 1).toFixed(2)}%"></div></div>`
      }
    </div>`;
}
