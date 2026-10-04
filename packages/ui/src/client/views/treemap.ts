import {
  type HierarchyRectangularNode,
  hierarchy,
  treemap,
  treemapSquarify,
} from "d3-hierarchy";
import type { TreemapNode } from "../queryHelpers";
import { isDark } from "./_colorScheme";

type Root = Pick<TreemapNode, "name" | "children"> & Partial<TreemapNode>;
type Rect = HierarchyRectangularNode<Root>;

const HUES = [215, 100, 40, 0, 190, 150, 25, 275, 325];
const HEADER_HEIGHT = 16;
const BREADCRUMB_HEIGHT = 26;
const FONT = "11px system-ui, -apple-system, sans-serif";
const MAX_SCALE = 64;

function escapeHTML(str: string) {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

function prependDuplicateTo(label: string) {
  if (label.includes(" ~ ")) {
    return `<b class='i-duplicate'>Duplicate</b> ${escapeHTML(label.split(" ~ ")[1])}`;
  }
  return escapeHTML(label);
}

function tooltipHTML(node: Root) {
  if (!node.type) return "";

  return [
    `<b>${node.type === "folder" ? "Folder" : "File"}</b>: ${prependDuplicateTo(node.name)}`,
    `<b>Size</b>: ${node.size}`,
    node.type === "folder"
      ? `<b>Files</b>: ${node.files}`
      : `<b>Path</b>: ${escapeHTML(node.fullPath ?? "")}`,
  ].join("<br/>");
}

// Each package/folder at the first branching level gets its own hue,
// descendants inherit it
function assignHues(roots: Root[]) {
  const hues = new Map<Root, number>();
  const inherit = (node: Root, hue: number) => {
    hues.set(node, hue);
    for (const child of node.children ?? []) inherit(child, hue);
  };

  let i = 0;
  for (const root of roots) {
    let node = root;
    while (node.children?.length === 1) node = node.children[0];
    for (const child of node.children ?? []) {
      inherit(child, HUES[i++ % HUES.length]);
    }
  }
  return hues;
}

function truncate(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  // ~6px per char, then shrink until it fits
  let len = Math.min(text.length - 1, Math.floor(maxWidth / 6));
  while (
    len > 0 &&
    ctx.measureText(`${text.slice(0, len)}…`).width > maxWidth
  ) {
    len--;
  }
  return len > 0 ? `${text.slice(0, len)}…` : "";
}

function createTreemap(host: HTMLElement, roots: TreemapNode[]) {
  const dark = isDark();
  let hues = new Map<Root, number>();
  const fullRoot: Root = { name: "Bundle", children: roots };

  host.style.position = "relative";
  host.innerHTML = "";

  const base = document.createElement("canvas");
  const overlay = document.createElement("canvas");
  for (const canvas of [base, overlay]) {
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
  }
  overlay.style.cursor = "pointer";
  overlay.style.touchAction = "none";

  const breadcrumb = document.createElement("div");
  breadcrumb.className = "treemap-breadcrumb";

  const tooltip = document.createElement("div");
  tooltip.className = "treemap-tooltip";

  host.append(base, overlay, breadcrumb, tooltip);

  // Path from the full root to the zoomed-in node
  let focusPath: Root[] = [fullRoot];
  let root: Rect | null = null;
  let rects: Rect[] = [];
  let hovered: Rect | null = null;
  let width = 0;
  let height = 0;
  // Wheel zoom: the layout is computed at `scale` x viewport size and
  // shifted by `offsetX/Y`, so headers and labels appear as boxes grow
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function fill(node: Rect) {
    const hue = hues.get(node.data);
    const depth = node.depth;
    if (hue === undefined) {
      return dark
        ? `hsl(0 0% ${18 + depth * 4}%)`
        : `hsl(0 0% ${88 - depth * 4}%)`;
    }
    const lightness = dark
      ? Math.min(30 + depth * 4, 55)
      : Math.min(52 + depth * 5, 85);
    return `hsl(${hue} ${dark ? 45 : 60}% ${lightness}%)`;
  }

  function buildHierarchy() {
    const focus = focusPath[focusPath.length - 1];
    // At the top, color packages inside "Source Code"/"node_modules";
    // when zoomed in, color the children of the zoomed folder
    hues = assignHues(focusPath.length === 1 ? roots : [focus]);
    root = hierarchy(focus)
      .sum((d) => (d.children?.length ? 0 : (d.value ?? 0)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)) as Rect;
  }

  function layout() {
    if (!root) return;
    rects = treemap<Root>()
      .tile(treemapSquarify)
      .size([width * scale, height * scale])
      .paddingInner(1)
      .paddingOuter(2)
      .paddingTop((node) =>
        node.x1 - node.x0 > 40 && node.y1 - node.y0 > HEADER_HEIGHT * 2
          ? HEADER_HEIGHT
          : 2,
      )
      .round(true)(root)
      .descendants()
      // Not visible anyway, skip to keep drawing and hit-testing cheap
      .filter((n) => n.x1 - n.x0 >= 1 && n.y1 - n.y0 >= 1);
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const ctx = base.getContext("2d") as CanvasRenderingContext2D;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(offsetX, offsetY);
    ctx.font = FONT;
    ctx.textBaseline = "middle";
    ctx.strokeStyle = dark ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.18)";
    ctx.lineWidth = 1;

    for (const node of rects) {
      // Outside of the viewport
      if (
        node.x1 + offsetX < 0 ||
        node.y1 + offsetY < 0 ||
        node.x0 + offsetX > width ||
        node.y0 + offsetY > height
      ) {
        continue;
      }
      const w = node.x1 - node.x0;
      const h = node.y1 - node.y0;
      ctx.fillStyle = fill(node);
      ctx.fillRect(node.x0, node.y0, w, h);
      ctx.strokeRect(node.x0 + 0.5, node.y0 + 0.5, w - 1, h - 1);

      if (w < 30 || h < 12) continue;

      const isFolder = !!node.children;
      // Folders: label in the header, files: label in the top-left corner
      if (isFolder && h <= HEADER_HEIGHT * 2) continue;
      const label = truncate(ctx, node.data.name, w - 8);
      if (!label) continue;
      ctx.fillStyle = dark ? "#eee" : "#111";
      ctx.font = isFolder ? `bold ${FONT}` : FONT;
      ctx.fillText(label, node.x0 + 4, node.y0 + HEADER_HEIGHT / 2 + 1);
      ctx.font = FONT;
    }

    drawHover();
    renderBreadcrumb();
  }

  function drawHover() {
    const dpr = window.devicePixelRatio || 1;
    const ctx = overlay.getContext("2d") as CanvasRenderingContext2D;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!hovered) return;
    ctx.translate(offsetX, offsetY);
    ctx.strokeStyle = dark ? "#fff" : "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      hovered.x0 + 1,
      hovered.y0 + 1,
      hovered.x1 - hovered.x0 - 2,
      hovered.y1 - hovered.y0 - 2,
    );
  }

  function renderBreadcrumb() {
    breadcrumb.innerHTML = "";
    focusPath.forEach((node, index) => {
      const item = document.createElement("span");
      item.className = "treemap-breadcrumb-item";
      item.textContent = node.name;
      item.onclick = () => zoomTo(focusPath.slice(0, index + 1));
      breadcrumb.append(item);
    });
  }

  // Deepest node under the cursor (children are drawn after their parents)
  function hitTest(screenX: number, screenY: number) {
    const x = screenX - offsetX;
    const y = screenY - offsetY;
    for (let i = rects.length - 1; i >= 0; i--) {
      const n = rects[i];
      if (x >= n.x0 && x < n.x1 && y >= n.y0 && y < n.y1) return n;
    }
    return null;
  }

  function zoomTo(path: Root[]) {
    focusPath = path;
    hovered = null;
    tooltip.style.display = "none";
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    buildHierarchy();
    layout();
    draw();
  }

  // Keep the zoomed layout covering the whole viewport
  function clampOffset() {
    offsetX = Math.min(0, Math.max(offsetX, width - width * scale));
    offsetY = Math.min(0, Math.max(offsetY, height - height * scale));
  }

  let frame = 0;
  let needsLayout = false;
  function scheduleRedraw(relayout: boolean) {
    if (relayout) needsLayout = true;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (needsLayout) layout();
      needsLayout = false;
      draw();
    });
  }

  // Wheel / trackpad pinch zooms around the cursor
  overlay.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(1, scale * Math.exp(-event.deltaY * 0.002)),
      );
      if (nextScale === scale) return;
      // Keep the point under the cursor in place
      const ratio = nextScale / scale;
      offsetX = event.offsetX - (event.offsetX - offsetX) * ratio;
      offsetY = event.offsetY - (event.offsetY - offsetY) * ratio;
      scale = nextScale;
      clampOffset();
      hovered = null;
      tooltip.style.display = "none";
      scheduleRedraw(true);
    },
    { passive: false },
  );

  // Drag pans the zoomed-in view
  let drag: { x: number; y: number; moved: boolean } | null = null;
  let suppressClick = false;
  overlay.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, moved: false };
    overlay.setPointerCapture(event.pointerId);
  });
  overlay.addEventListener("pointerup", () => {
    suppressClick = !!drag?.moved;
    drag = null;
    overlay.style.cursor = "pointer";
  });

  overlay.addEventListener("mousemove", (event) => {
    if (drag) {
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (drag.moved || Math.abs(dx) + Math.abs(dy) > 3) {
        drag.moved = true;
        drag.x = event.clientX;
        drag.y = event.clientY;
        offsetX += dx;
        offsetY += dy;
        clampOffset();
        overlay.style.cursor = "grabbing";
        tooltip.style.display = "none";
        scheduleRedraw(false);
        return;
      }
    }

    const node = hitTest(event.offsetX, event.offsetY);
    if (node !== hovered) {
      hovered = node;
      drawHover();
      const html = node ? tooltipHTML(node.data) : "";
      tooltip.innerHTML = html;
      tooltip.style.display = html ? "block" : "none";
    }
    // Keep the tooltip inside the chart
    const left = Math.min(event.offsetX + 12, width - tooltip.offsetWidth - 4);
    const top =
      event.offsetY + 12 + tooltip.offsetHeight > height
        ? event.offsetY - tooltip.offsetHeight - 8
        : event.offsetY + 12;
    tooltip.style.left = `${Math.max(left, 0)}px`;
    tooltip.style.top = `${Math.max(top, 0)}px`;
  });

  overlay.addEventListener("mouseleave", () => {
    hovered = null;
    drawHover();
    tooltip.style.display = "none";
  });

  // Click zooms into the folder (or the parent folder of a file)
  overlay.addEventListener("click", (event) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    let node = hitTest(event.offsetX, event.offsetY);
    if (node && !node.children) node = node.parent;
    if (!node || node.depth === 0) return;
    zoomTo([
      ...focusPath,
      ...node
        .ancestors()
        .reverse()
        .slice(1)
        .map((n) => n.data),
    ]);
  });

  // Right click zooms out one level
  overlay.addEventListener("contextmenu", (event) => {
    if (focusPath.length === 1) return;
    event.preventDefault();
    zoomTo(focusPath.slice(0, -1));
  });

  return {
    resize(w: number, h: number) {
      width = w;
      height = Math.max(h - BREADCRUMB_HEIGHT, 0);
      const dpr = window.devicePixelRatio || 1;
      for (const canvas of [base, overlay]) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      if (!root) buildHierarchy();
      clampOffset();
      layout();
      draw();
    },
  };
}

// Only one chart is alive at a time; the previous one is disposed on re-render
let current: { dispose(): void } | null = null;

discovery.view.define("treemap", (el, _config, data, context) => {
  current?.dispose();

  const host = el as HTMLElement;
  let chart: ReturnType<typeof createTreemap> | null = null;
  let frame = 0;

  // Draw once the element is attached and sized, then follow its size
  const observer = new ResizeObserver(() => {
    if (!host.isConnected) {
      self.dispose();
      return;
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const { clientWidth, clientHeight } = host;
      if (clientWidth === 0 || clientHeight === 0) return;
      try {
        chart ??= createTreemap(host, data as TreemapNode[]);
        chart.resize(clientWidth, clientHeight);
      } catch (e) {
        console.error(e, data);
        self.dispose();
        discovery.view.render(
          el,
          {
            view: "alert-danger",
            data: '"Error rendering chart, please check the console for more information."',
          },
          data,
          context,
        );
      }
    });
  });

  const self = {
    dispose() {
      observer.disconnect();
      cancelAnimationFrame(frame);
      chart = null;
      if (current === self) current = null;
    },
  };

  observer.observe(host);
  current = self;
});
