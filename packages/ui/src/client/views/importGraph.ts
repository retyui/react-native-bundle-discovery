import { type HierarchyPointNode, stratify, tree } from "d3-hierarchy";
import type { ImportGraphLink, ImportGraphNode } from "../queryHelpers";
import { isDark } from "./_colorScheme";
import { escapeHTML, formatBytes } from "./_html";

type Point = HierarchyPointNode<ImportGraphNode>;
type GraphData = { nodes: ImportGraphNode[]; links: ImportGraphLink[] };

const SVG_NS = "http://www.w3.org/2000/svg";
const ROW_HEIGHT = 24;
const LEVEL_GAP = 220;
const MIN_HEIGHT = 240;
const MAX_HEIGHT = 640;
const MIN_RADIUS = 4;
const MAX_RADIUS = 11;
const LABEL_WIDTH = 180;
const MIN_SCALE = 0.2;
const MAX_SCALE = 6;

const COLORS = {
  current: "#e5484d",
  root: "#f5b700",
  own: "#8e6fe0",
  nodeModule: "#2b9fd8",
};

function nodeColor(node: ImportGraphNode) {
  if (node.isCurrent) return COLORS.current;
  if (node.isRoot) return COLORS.root;
  return node.isNodeModule ? COLORS.nodeModule : COLORS.own;
}

function basename(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  return el;
}

function legend() {
  const items = [
    [COLORS.current, "Current module"],
    [COLORS.root, "Entry point"],
    [COLORS.own, "Your code"],
    [COLORS.nodeModule, "node_modules"],
  ];
  const dots = items
    .map(
      ([color, text]) =>
        `<span><span class="ig-dot" style="background:${color}"></span>${text}</span>`,
    )
    .join("");
  return `${dots}<span class="ig-hint">Arrows point to the imported module · scroll to zoom · drag to pan · click to open</span>`;
}

// The graph is a tree: every module is reached once, by its first importer
function layout(data: GraphData) {
  const parentOf = new Map(data.links.map((l) => [l.source, l.target]));
  const root = stratify<ImportGraphNode>()
    .id((d) => d.id)
    .parentId((d) => parentOf.get(d.id))(data.nodes)
    // Heavier importers first
    .sort((a, b) => b.data.size - a.data.size);
  // x - vertical position (rows), y - horizontal position (levels)
  return tree<ImportGraphNode>().nodeSize([ROW_HEIGHT, LEVEL_GAP])(root);
}

function createGraph(host: HTMLElement, data: GraphData) {
  const dark = isDark();
  const points = layout(data).descendants();
  const maxSize = Math.max(1, ...points.map((p) => p.data.size));
  const radius = (p: Point) =>
    MIN_RADIUS + Math.sqrt(p.data.size / maxSize) * (MAX_RADIUS - MIN_RADIUS);

  const minX = Math.min(...points.map((p) => p.x)) - ROW_HEIGHT;
  const maxX = Math.max(...points.map((p) => p.x)) + ROW_HEIGHT;
  const maxY = Math.max(...points.map((p) => p.y)) + LABEL_WIDTH;
  const height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, maxX - minX));

  host.innerHTML = `<div class="ig-legend">${legend()}</div>`;
  const rootEl = svg("svg", { class: "ig-svg", height });
  const defs = svg("defs");
  const marker = svg("marker", {
    id: "ig-arrow",
    viewBox: "0 -4 8 8",
    refX: 8,
    refY: 0,
    markerWidth: 7,
    markerHeight: 7,
    orient: "auto",
  });
  marker.append(svg("path", { d: "M0,-4L8,0L0,4", class: "ig-arrow" }));
  defs.append(marker);
  const viewport = svg("g");
  const linksLayer = svg("g", { class: "ig-links" });
  const nodesLayer = svg("g", { class: "ig-nodes" });
  viewport.append(linksLayer, nodesLayer);
  rootEl.append(defs, viewport);

  const tooltip = document.createElement("div");
  tooltip.className = "treemap-tooltip";
  host.append(rootEl, tooltip);

  // Links go from the importer (child) to the imported module (parent)
  const linkEls = new Map<Point, SVGPathElement>();
  for (const point of points) {
    const parent = point.parent;
    if (!parent) continue;
    const startY = point.y - radius(point);
    const endY = parent.y + radius(parent) + 2;
    const midY = (startY + endY) / 2;
    const path = svg("path", {
      d: `M${startY},${point.x}C${midY},${point.x} ${midY},${parent.x} ${endY},${parent.x}`,
      "marker-end": "url(#ig-arrow)",
    });
    linksLayer.append(path);
    linkEls.set(point, path);
  }

  const nodeEls = new Map<Point, SVGGElement>();
  const pointByEl = new Map<Element, Point>();
  for (const point of points) {
    const group = svg("g", {
      class: "ig-node",
      transform: `translate(${point.y},${point.x})`,
    });
    group.append(
      svg("circle", {
        r: radius(point),
        fill: nodeColor(point.data),
        stroke: dark ? "#111" : "#fff",
        "stroke-width": 1.5,
      }),
    );
    const label = svg("text", { x: radius(point) + 4, y: 4 });
    label.textContent = basename(point.data.id);
    group.append(label);
    nodesLayer.append(group);
    nodeEls.set(point, group);
    pointByEl.set(group, point);
  }

  // Pan & zoom of the whole graph, starting with the graph fitted into the view
  const width = host.clientWidth;
  let scale = Math.min(
    1,
    Math.max(MIN_SCALE, Math.min(width / maxY, height / (maxX - minX))),
  );
  let tx = MAX_RADIUS * 2 * scale;
  let ty = (height - (maxX - minX) * scale) / 2 - minX * scale;
  function applyTransform() {
    viewport.setAttribute(
      "transform",
      `translate(${tx},${ty}) scale(${scale})`,
    );
  }
  applyTransform();

  // Hover: highlight the chain to the current module and the direct importers
  function highlight(point: Point | null) {
    rootEl.classList.toggle("ig-has-hover", !!point);
    const active = new Set<Point>(
      point ? [...point.ancestors(), ...(point.children ?? [])] : [],
    );
    for (const [p, el] of nodeEls) {
      el.classList.toggle("ig-active", active.has(p));
    }
    for (const [p, el] of linkEls) {
      el.classList.toggle(
        "ig-active",
        active.has(p) && !!p.parent && active.has(p.parent),
      );
    }
  }

  function moveTooltip(event: PointerEvent) {
    const box = host.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    tooltip.style.left = `${Math.max(0, Math.min(x + 12, box.width - tooltip.offsetWidth - 4))}px`;
    tooltip.style.top = `${y + 16}px`;
  }

  let drag: {
    x: number;
    y: number;
    moved: boolean;
    point: Point | undefined;
  } | null = null;

  for (const [point, el] of nodeEls) {
    el.addEventListener("pointerenter", (event) => {
      if (drag) return;
      highlight(point);
      const via = point.depth - 1;
      tooltip.innerHTML = [
        `<b>${escapeHTML(point.data.id)}</b>`,
        `<b>Size</b>: ${formatBytes(point.data.size)}`,
        point.data.isCurrent
          ? "Current module"
          : via === 0
            ? "Imports it directly"
            : `Imports it via ${via} ${via === 1 ? "module" : "modules"}`,
      ].join("<br/>");
      tooltip.style.display = "block";
      moveTooltip(event);
    });
    el.addEventListener("pointermove", moveTooltip);
    el.addEventListener("pointerleave", () => {
      highlight(null);
      tooltip.style.display = "none";
    });
  }

  // Drag pans, a click on a node (without moving) opens its module page
  rootEl.addEventListener("pointerdown", (event) => {
    const nodeEl = (event.target as Element).closest(".ig-node");
    drag = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
      point: nodeEl ? pointByEl.get(nodeEl) : undefined,
    };
    rootEl.setPointerCapture(event.pointerId);
  });
  rootEl.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    drag.moved = true;
    drag.x = event.clientX;
    drag.y = event.clientY;
    tx += dx;
    ty += dy;
    tooltip.style.display = "none";
    applyTransform();
  });
  rootEl.addEventListener("pointerup", () => {
    const current = drag;
    drag = null;
    if (current?.point && !current.moved && !current.point.data.isCurrent) {
      window.location.hash = discovery.encodePageHash(
        "module",
        current.point.data.id,
      );
    }
  });

  // Wheel / trackpad pinch zooms around the cursor
  rootEl.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const next = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, scale * Math.exp(-event.deltaY * 0.002)),
      );
      const box = rootEl.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      tx = x - ((x - tx) * next) / scale;
      ty = y - ((y - ty) * next) / scale;
      scale = next;
      applyTransform();
    },
    { passive: false },
  );
}

discovery.view.define("import-graph", (el, _config, data) => {
  const host = el as HTMLElement;
  const graph = data as GraphData;
  if (!graph?.nodes?.length) return;

  // Lay out once the element is attached and has a width
  const observer = new ResizeObserver(() => {
    if (!host.isConnected || host.clientWidth === 0) return;
    observer.disconnect();
    createGraph(host, graph);
  });
  observer.observe(host);
});
