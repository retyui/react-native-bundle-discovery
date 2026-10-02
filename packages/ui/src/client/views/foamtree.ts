// @ts-expect-error untyped vendored UMD bundle (resolves to `any`)
import { FoamTree } from "../../../vendors/foamtree.js";

declare global {
  interface Window {
    __el?: HTMLElement | DocumentFragment;
  }
}

// `data` items are mutated in place from `{ value }` objects to raw values
type SeriesOptions = { data?: { value?: unknown }[] };

interface FoamTreeGroupInfo {
  type?: string;
  label: string;
  size: string;
  fullPath?: string;
  files?: number;
}

function injectTooltip(root: Element) {
  const t = root.querySelector<HTMLElement>(".tooltip");
  if (t) return t;

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.id = "foamtree-tooltip";
  root.appendChild(tooltip);
  return tooltip;
}

function prependDuplicateTo(label: string) {
  if (label.includes(" ~ ")) {
    return `<b class='i-duplicate'>Duplicate</b> ${label.split(" ~ ")[1]}`;
  }
  return label;
}

// Based on https://github.com/webpack-contrib/webpack-bundle-analyzer/blob/master/client/components/Treemap.jsx
discovery.view.define("foamtree", (el, _config, rawData, context) => {
  if (Array.isArray(rawData?.options?.series)) {
    rawData.options.series.forEach((e: SeriesOptions) => {
      if (e.data?.[0]?.value !== undefined) {
        // mutate data by link
        e.data = e.data.map((d) => d.value ?? null) as SeriesOptions["data"];
      }
    });
  }

  // console.log({ rawData });

  // Render after element will be added to the DOM
  // to avoid "FoamTree: element has zero dimensions: 0 x 0" error
  setTimeout(() => {
    try {
      // Dirty hack to fix shadow DOM issue, xd
      window.__el = el;

      const root = (el as HTMLElement).closest(".discovery-root") as Element;
      const tooltip = injectTooltip(root);

      window.addEventListener("resize", () => ft.resize(), { passive: true });

      root.addEventListener(
        "mousemove",
        (event: Event) => {
          if (tooltip.style.display === "none") return;
          tooltip.style.left = `${(event as MouseEvent).pageX + 10}px`;
          tooltip.style.top = `${(event as MouseEvent).pageY + 10}px`;
        },
        {
          passive: true,
        },
      );
      el.addEventListener("mouseover", () => {
        tooltip.style.display = "block";
      });
      el.addEventListener("mouseout", () => {
        tooltip.style.display = "none";
      });

      const ft = new FoamTree({
        element: el,
        layout: "squarified",
        stacking: "flattened",
        pixelRatio: window.devicePixelRatio || 1,
        maxGroups: Infinity,
        maxGroupLevelsDrawn: Infinity,
        maxGroupLabelLevelsDrawn: Infinity,
        maxGroupLevelsAttached: Infinity,
        wireframeLabelDrawing: "always",
        groupMinDiameter: 0,
        groupLabelVerticalPadding: 0.2,
        rolloutDuration: 0,
        pullbackDuration: 0,
        fadeDuration: 0,
        groupExposureZoomMargin: 0.2,
        zoomMouseWheelDuration: 300,
        openCloseDuration: 200,
        onGroupClick(event: { preventDefault(): void; group: unknown }) {
          event.preventDefault();
          ft.zoom(event.group);
        },
        onGroupDoubleClick: (e: { preventDefault(): void }) =>
          e.preventDefault(),
        onGroupHover(event: {
          preventDefault(): void;
          group?: FoamTreeGroupInfo | null;
        }) {
          // Ignoring hovering on `FoamTree` branding group and the root group
          if (event.group && event.group === rawData.options.dataObject) {
            return event.preventDefault();
          }

          const { group } = event;

          if (group?.type) {
            const htmlContent = [
              `<b class="tooltip-name">${group.type}</b>: ${prependDuplicateTo(group.label)}`,
              `<b>Size</b>: ${group.size}`,
              group.type === "folder" ? null : `<b>Path</b>: ${group.fullPath}`,
              group.type === "folder" ? `<b>Files</b>: ${group.files}` : null,
            ]
              .filter((e) => !!e)
              .join("<br/>");

            tooltip.style.display = "block";
            tooltip.innerHTML = htmlContent;
          } else {
            tooltip.style.display = "none";
            tooltip.innerHTML = "";
          }

          // if (group) {
          //   this.setState({
          //     showTooltip: true,
          //     tooltipContent: this.getTooltipContent(group)
          //   });
          // } else {
          //   this.setState({showTooltip: false});
          // }
        },
        ...rawData.options,
      });
    } catch (e) {
      console.error(e, rawData);
      discovery.view.render(
        el,
        {
          view: "alert-danger",
          data: '"Error rendering chart, please check the console for more information."',
        },
        rawData,
        context,
      );
    }
  }, 0);
});
