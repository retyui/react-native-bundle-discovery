type SingleViewConfig = DiscoveryViewConfig;
type ViewConfig = SingleViewConfig | string;

function getPackage(entry: string) {
  return `
  $packages: $.packages;
  $totalSize: $.modules.sum(=>output.sizeInBytes);
  $toModule: => {
    ext:  $.path.getFileExtension(),
    name: $.path, 
    size: $.output.sizeInBytes.formatBytes(), 
    percent: ($.output.sizeInBytes / $totalSize).percent(3),
  };

  ${entry}.group(=> path.getModulesName())
     .map(=> ({ 
        $pkgName: $.key;
        pkgName: $pkgName, // example: lodash
        size: $.value.sum(=>output.sizeInBytes),
        pkgInstances: $.value
          .group(=> path.split('node_modules/' + $pkgName).pick(0) + 'node_modules/' + $pkgName)
          .map(=> {
             $pkgNameWithPath: $.key;
             $pkgInfo: $packages.[path = $pkgNameWithPath][0];
             pkgName: $pkgNameWithPath, // example: node_modules/lodash
             version: $pkgInfo.version,
             metadata: $pkgInfo.metadata,
             size: $.value.sum(=> output.sizeInBytes),
             modules: $.value.map(=> $.$toModule()),
          }),
     }))`;
}

type SortOption = { value: string; text: string };
type SortToggleConfig = {
  name: string;
  onInit?: (value: string | null, name: string) => void;
  onChange?: (value: string | null, name: string) => void;
};

// Like "toggle-group", but a click on the checked toggle unsets the value
function renderSortToggleGroup(
  el: HTMLElement,
  config: SortToggleConfig,
  options: SortOption[],
) {
  let current: string | null = null;
  const label = document.createElement("div");
  label.className = "view-toggle-group-before";
  label.textContent = "Sort by:";
  el.classList.add("view-toggle-group", "sort-toggle-group");
  el.append(label);

  const toggles = options.map(({ value, text }) => {
    const toggle = document.createElement("div");
    toggle.className = "view-toggle onclick";
    toggle.textContent = text;
    toggle.addEventListener("click", () => {
      current = current === value ? null : value;
      toggles.forEach((t, i) => {
        t.classList.toggle("checked", options[i].value === current);
      });
      config.onChange?.(current, config.name);
    });
    return el.appendChild(toggle);
  });

  config.onInit?.(current, config.name);
}

// Same as "content-filter", but with a "Sort by" toggle and a filtered size badge.
// "Sort by" is on the left of the filter. Only the list (`.content`) scrolls,
// the filter/sort controls stay on top.
function getSortableContentFilter({
  data,
  className,
  nameField,
  sizeField,
  duplicatesCount,
  defaultSort,
  content,
}: {
  data: string;
  className?: string;
  nameField: string; // jora field to filter & sort by name
  sizeField: string; // jora field with size in bytes
  duplicatesCount: string; // jora expression with number of duplicates
  defaultSort?: string; // jora sort() args used when "Sort by" is unset
  content: (listData: string) => SingleViewConfig;
}): SingleViewConfig {
  const filtered = `.[${nameField} ~= #.filterByPathStr]`;

  return {
    view: "block",
    data,
    className: `view-content-filter sortable-content-filter ${className ?? ""}`,
    content: {
      view: "context",
      modifiers: [
        {
          view: renderSortToggleGroup,
          name: "sortBy",
          data: `
            $hasDuplicates: .[${duplicatesCount} > 0];
            [
              { value: 'size', text: 'Size' },
              { value: 'name', text: 'Name' },
              { value: 'duplicates', text: 'Duplicates' },
            ].[value != 'duplicates' or $hasDuplicates]
          `,
        },
        {
          view: "persisted-filter-input",
          persistKey: `${className}:${nameField}`,
          name: "filterByPathStr",
          placeholder: "Filter",
        },
      ],
      content: [
        {
          view: "badge",
          when: `#.filterByPathStr and ${filtered}`,
          className: "filtered-size",
          data: `{ text: 'Filtered size: ' + ${filtered}.sum(=> ${sizeField}).formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }`,
        },
        {
          view: "block",
          className: "content",
          content: content(`
            $filtered: ${filtered};
            #.sortBy = 'name' ? $filtered.sort(${nameField} asc)
            : #.sortBy = 'duplicates' ? $filtered.sort(${duplicatesCount} desc, ${sizeField} desc)
            : #.sortBy = 'size' ? $filtered.sort(${sizeField} desc)
            : ${defaultSort ? `$filtered.sort(${defaultSort})` : "$filtered"}
          `),
        },
      ],
    },
  };
}

const metadataTooltip = {
  view: "text",
  when: "metadata.createdAt",
  data: "'Published ' + metadata.createdAt.formatDate() + ' (' + metadata.createdAt.timeAgo() + ')'",
};

// Compact npm metadata badges (`metadata` from the report)
function getMetadataBadges({
  deprecated,
  outdated,
  latestVersion,
  renderLatestVersion,
}: {
  deprecated: string;
  outdated: string;
  latestVersion: string;
  renderLatestVersion: boolean;
}): SingleViewConfig[] {
  return [
    {
      view: "pill-badge",
      when: deprecated,
      className: "badge-deprecated",
      data: `{ text: 'deprecated', message: ${deprecated} }`,
      tooltip: "text: message",
    },
    renderLatestVersion
      ? {
          view: "pill-badge",
          when: outdated,
          className: "badge-warn",
          data: `{ text: '↑ v' + ${latestVersion} }`,
          tooltip: "text: 'Latest version on npm'",
        }
      : null,
  ].filter(Boolean) as SingleViewConfig[];
}

// Set on the size badge of the biggest items, see `withSizeHeat()` query helper
// (evaluated against the badge's data, so the data has to carry `sizeHeat`)
const SIZE_HEAT_CLASS = "=sizeHeat ? 'size-heat size-heat-' + sizeHeat : ''";

function getPackageList({
  data,
  itemPkgName,
  showCopiesBadge,
  expanded,
  limit,
  subLimit,
}: {
  data: string;
  itemPkgName: ViewConfig;
  showCopiesBadge?: boolean;
  expanded?: boolean | number;
  limit?: number | false;
  subLimit?: number | false;
}): SingleViewConfig {
  return {
    view: "list",
    data,
    emptyText: "No packages found.",
    limit,
    item: {
      view: "tree",
      expanded,
      itemConfig: {
        content: [
          itemPkgName,
          "text: ' '",
          {
            view: "pill-badge",
            className: SIZE_HEAT_CLASS,
            data: "{ text: size.formatBytes(), sizeHeat }",
          },
          // Summary of all instances (visible when the tree is collapsed)
          ...getMetadataBadges({
            deprecated: "pkgInstances.metadata.deprecated[0]",
            outdated: "pkgInstances.[metadata and not metadata.isLatest]",
            latestVersion: "pkgInstances.metadata.latestVersion[0]",
            renderLatestVersion: false,
          }),
          showCopiesBadge
            ? {
                view: "pill-badge",
                when: "pkgInstances.size() > 1",
                className: "badge-danger",
                data: "(pkgInstances.size() - 1).pluralBadge(['copy','copies'], '+')",
              }
            : null,
          {
            view: "pill-badge",
            data: "pkgInstances.modules.size().pluralBadge(['file','files'])",
          },
        ].filter(Boolean),
        children: `$.pkgInstances`,
        itemConfig: {
          view: "tree-leaf",
          limit: subLimit,
          content: [
            //
            "text:pkgName",
            "text:' '",
            {
              view: "pill-badge",
              data: "{ text: 'v' + version, metadata }",
              color: "#0af",
              tooltip: metadataTooltip,
            },
            "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
            {
              view: "pill-badge",
              data: "modules.size().pluralBadge(['file','files'])",
            },
            ...getMetadataBadges({
              deprecated: "metadata.deprecated",
              outdated: "metadata and not metadata.isLatest",
              latestVersion: "metadata.latestVersion",
              renderLatestVersion: true,
            }),
          ],
          children: `$.modules`,
          itemConfig: {
            view: "tree-leaf",
            content: getTreeModule({ hasPercent: true }),
          },
        },
      },
    },
  };
}

function getTreeModule({
  hasTextMatch = false,
  hasPercent = false,
}: {
  hasTextMatch?: boolean;
  hasPercent?: boolean;
} = {}): ViewConfig[] {
  return [
    {
      view: "pill-badge",
      className: "ext-badge",
      data: "{ text: ext, color: ext.getExtColor() }",
    },
    hasTextMatch
      ? {
          view: "link",
          content: hasTextMatch ? "text-match" : "text",
          data: `{
          href: name.pageLink("module", {}),
          text: name,
          match: #.filterByPathStr
        }`,
        }
      : {
          view: "link",
          data: `{ href: $.name.pageLink("module", {}), text: $.name }`,
        },
    "text:' '",
    {
      view: "badge",
      when: "isEntry",
      text: "Entrypoint",
      color: "gold",
      textColor: "black",
    },
    {
      view: "pill-badge",
      className: SIZE_HEAT_CLASS,
      data: "{ text: size, sizeHeat }",
    },
    hasPercent
      ? "pill-badge:{ text: percent, color: 'rgba(120, 177, 9, 0.35)' }"
      : null,
  ].filter(Boolean) as ViewConfig[];
}
function getModulesTree({
  data,
  limit,
  sortable,
}: {
  data: string;
  limit?: number | false;
  sortable?: boolean;
}): SingleViewConfig {
  if (!data) {
    throw new Error("[getModulesTree]: data is required");
  }
  const getList = (listData: string): SingleViewConfig => ({
    view: "list",
    limit,
    data: listData,
    emptyText: "No modules found.",
    item: {
      view: "tree",
      expanded: false,
      itemConfig: {
        content: getTreeModule({ hasTextMatch: true }),
        children: `
            [
               {
                 title:'Imported by modules',
                 data: $.reasons,
                 type: 'reasons',
               },
               {
                 title:'Similar copies',
                 data: $.duplicates,
                 type: 'duplicates',
               }
            ].filter(=> $.data.size() > 0)
          `,
        itemConfig: {
          view: "switch",
          content: [
            {
              when: 'type="reasons"',
              content: {
                view: "tree-leaf",
                content: [
                  "text:title",
                  "text:' '",
                  "badge:{ text: $.data.size() }",
                ],
                children: `$.data`,
                itemConfig: {
                  view: "tree-leaf",
                  content: getTreeModule(),
                },
              },
            },
            {
              when: 'type="duplicates"',
              content: {
                view: "tree-leaf",
                content: [
                  "text:title",
                  "text:' '",
                  "badge:{ text: $.data.size() }",
                ],
                children: `$.data`,
                itemConfig: {
                  view: "tree-leaf",
                  content: getTreeModule(),
                },
              },
            },
          ],
        },
      },
    },
  });

  if (sortable) {
    return getSortableContentFilter({
      data,
      nameField: "name",
      sizeField: "sizeInBytes",
      duplicatesCount: "duplicates.size()",
      content: getList,
    });
  }

  return {
    view: "content-filter",
    data,
    name: "filterByPathStr",
    content: getList(".[name ~= #.filterByPathStr]"),
  };
}

const SEVERITY_BADGE = `{
  text: severity = 'high' ? 'High impact' : severity = 'medium' ? 'Saves size' : 'Advice',
  color: severity = 'high' ? 'rgba(220, 50, 60, 0.3)' : severity = 'medium' ? 'rgba(255, 165, 0, 0.35)' : 'rgba(0, 170, 255, 0.25)',
}`;

// One recommendation from the shared rules (the same as `analyze` CLI command)
const findingItem: SingleViewConfig = {
  view: "expand",
  className: "='in-finding in-finding-' + severity",
  header: [
    { view: "pill-badge", className: "in-severity", data: SEVERITY_BADGE },
    "text: title",
    {
      view: "pill-badge",
      when: "savings",
      data: "{ text: '~' + savings.formatBytes(), postfix: savingsShare.percent(2), color: 'rgba(120, 177, 9, 0.35)' }",
      tooltip: "text: 'Estimated savings: size and share of the bundle'",
    },
    {
      view: "inline-list",
      className: "in-packages",
      when: "packageNames",
      data: "packageNames",
      item: {
        view: "link",
        className: "mo-chip mo-chip-pkg",
        data: `{ href: $.pageLink("package", {}), text: $ }`,
      },
    },
  ],
  content: {
    view: "block",
    className: "in-finding-content",
    content: [
      { view: "markdown", data: "message" },
      {
        view: "block",
        when: "packagesText",
        className: "in-pre",
        content: "text: packagesText",
      },
      {
        view: "expand",
        when: "affected",
        className: "in-affected",
        header: [
          "text: 'Affected modules '",
          "pill-badge: affected.size()",
          "pill-badge: { text: affectedSize.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
        ],
        content: {
          view: "list",
          data: "affected",
          limit: 20,
          item: { view: "block", content: getTreeModule() },
        },
      },
      {
        view: "block",
        when: "docsUrls",
        className: "in-docs",
        content: [
          "text: 'Learn more: '",
          {
            view: "inline-list",
            data: "docsUrls",
            item: {
              view: "link",
              external: true,
              data: "{ href: $, text: $ }",
            },
          },
        ],
      },
    ],
  },
};

// "Insights" tab: summary, heaviest packages/modules and recommendations
function getInsightsTab(): SingleViewConfig {
  return {
    view: "block",
    className: "tab-scroll insights",
    data: "$.bundleInsights()",
    content: [
      { view: "bundle-insights" },
      {
        view: "h3",
        className: "in-title",
        content: [
          "text: 'Recommendations '",
          {
            view: "pill-badge",
            when: "hasRecommendations",
            data: "findings.size()",
          },
        ],
      },
      {
        view: "alert-warning",
        when: "not hasRecommendations",
        content:
          "html: 'Recommendations are only available for production bundles. Generate the report from a bundle built with <code>--dev false</code> to see them.'",
      },
      {
        view: "alert-success",
        when: "hasRecommendations and not findings",
        content: "text: 'No recommendations.'",
      },
      { view: "list", data: "findings", item: findingItem },
    ],
  };
}

interface ClipboardButtonElement extends HTMLElement {
  __timer?: ReturnType<typeof setTimeout>;
}

function getCopyToClipboardButton({
  textToCopy,
  className,
  text,
}: {
  textToCopy: string;
  className?: string;
  text?: string;
}): SingleViewConfig {
  return {
    view: "button",
    className: `${className ?? ""} copy-to-clipboard`,
    text,
    data: `{ textToCopy: ${textToCopy} }`,
    onClick(elm: ClipboardButtonElement, data: { textToCopy: string }) {
      clearTimeout(elm.__timer);
      navigator.clipboard
        .writeText(data.textToCopy)
        .then(() => {
          elm.classList.add("done");
          elm.__timer = setTimeout(() => elm.classList.remove("done"), 2000);
        })
        .catch(() => {
          elm.classList.add("err");
          elm.__timer = setTimeout(() => elm.classList.remove("err"), 2000);
        });
    },
  };
}

export {
  getCopyToClipboardButton,
  getInsightsTab,
  getModulesTree,
  getPackage,
  getPackageList,
  getSortableContentFilter,
  getTreeModule,
};
