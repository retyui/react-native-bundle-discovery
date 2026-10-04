import { diffLines } from "diff";
import { escapeHTML } from "./_html";

interface CodeDiffData {
  before: string | Promise<string>;
  after: string | Promise<string>;
}

// Unchanged lines shown around each change
const CONTEXT = 3;

type LineKind = "add" | "del" | "same";

interface Line {
  kind: LineKind;
  text: string;
  oldNo: number | null;
  newNo: number | null;
}

function toLines(before: string, after: string): Line[] {
  const lines: Line[] = [];
  let oldNo = 1;
  let newNo = 1;
  diffLines(before, after).forEach((part) => {
    const kind: LineKind = part.added ? "add" : part.removed ? "del" : "same";
    const texts = part.value.replace(/\n$/, "").split("\n");
    texts.forEach((text) => {
      lines.push({
        kind,
        text,
        oldNo: kind === "add" ? null : oldNo++,
        newNo: kind === "del" ? null : newNo++,
      });
    });
  });
  return lines;
}

function lineHTML({ kind, text, oldNo, newNo }: Line) {
  const sign = kind === "add" ? "+" : kind === "del" ? "−" : " ";
  return `<div class="cd-line cd-${kind}"><span class="cd-no">${oldNo ?? ""}</span><span class="cd-no">${newNo ?? ""}</span><span class="cd-sign">${sign}</span><span class="cd-text">${escapeHTML(text)}</span></div>`;
}

function render(lines: Line[]) {
  const added = lines.filter((line) => line.kind === "add").length;
  const removed = lines.filter((line) => line.kind === "del").length;
  if (added + removed === 0) {
    return `<div class="cd-empty">No differences</div>`;
  }

  // Keep CONTEXT lines around changes, fold the rest
  const visible = lines.map((_, i) =>
    lines
      .slice(Math.max(0, i - CONTEXT), i + CONTEXT + 1)
      .some((line) => line.kind !== "same"),
  );
  let html = "";
  let i = 0;
  while (i < lines.length) {
    if (visible[i]) {
      html += lineHTML(lines[i]);
      i++;
      continue;
    }
    const start = i;
    while (i < lines.length && !visible[i]) i++;
    const folded = lines.slice(start, i);
    html += `<button type="button" class="cd-fold">⋯ ${folded.length} unchanged ${folded.length === 1 ? "line" : "lines"}</button><div class="cd-folded" hidden>${folded.map(lineHTML).join("")}</div>`;
  }

  return `
    <div class="cd-stats"><span class="cd-stat-add">+${added}</span> <span class="cd-stat-del">−${removed}</span> lines</div>
    <div class="cd-code">${html}</div>`;
}

discovery.view.define("code-diff", async (el, _config, data) => {
  const { before, after } = data as CodeDiffData;
  const root = el as HTMLElement;
  root.innerHTML = render(toLines(await before, await after));
  root.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest(".cd-fold");
    if (!button) return;
    button.nextElementSibling?.removeAttribute("hidden");
    button.remove();
  });
});
