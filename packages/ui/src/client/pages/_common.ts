const platformColor = `transformOptions.platform = 'android' ? 'rgba(194, 239, 116, .4)' : 'rgba(119, 31, 218, .4)'`;

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
// Only the list (`.content`) scrolls, the filter/sort controls stay on top.
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
          view: "input",
          name: "filterByPathStr",
          type: "regexp",
          placeholder: "Filter",
        },
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
const outdatedColor = "rgba(255, 165, 0, 0.35)";

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
      data: `{ text: '⚠️ deprecated', message: ${deprecated} }`,
      color: "#cf222e",
      textColor: "white",
      darkColor: "#f85149",
      darkTextColor: "white",
      tooltip: "text: message",
    },
    renderLatestVersion
      ? {
          view: "pill-badge",
          when: outdated,
          data: `{ text: '↑ v' + ${latestVersion} }`,
          color: outdatedColor,
          tooltip: "text: 'Latest version on npm'",
        }
      : null,
  ].filter(Boolean) as SingleViewConfig[];
}

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
    emptyText: "⚠️ No packages found",
    limit,
    item: {
      view: "tree",
      expanded,
      itemConfig: {
        content: [
          itemPkgName,
          "text: ' '",
          "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
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
                data: "(pkgInstances.size() - 1).pluralBadge(['copy','copies'], '+')",
                color: "rgba(255, 0, 0, 0.35)",
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
    "pill-badge:{ text: ext, color: ext.getExtColor() }",
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
    "pill-badge:{ text: size, color: 'rgba(120, 177, 9, 0.35)' }",
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
    emptyText: "⚠️ No modules found",
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

const metadata: Record<string, SingleViewConfig> = {
  platform: {
    when: "transformOptions.platform",
    view: "badge",
    data: `{ prefix: 'Platform: ', text: transformOptions.platform, color: ${platformColor} }`,
  },
  size: {
    when: "modules.filter(=> $.path has 'node_modules').size()",
    view: "badge",
    data: `{ prefix: 'Size: ', text: modules.sum(=>output.sizeInBytes).formatBytes(), color: ${platformColor} }`,
  },
  node_modules_size: {
    when: "modules.filter(=> $.path has 'node_modules').size()",
    view: "badge",
    data: "{ prefix: 'node_modules: ', text: modules.filter(=> $.path has 'node_modules').sum(=>output.sizeInBytes).formatBytes(), color: 'rgba(255, 0, 0, 0.35)' }",
  },
  source_code_size: {
    when: "modules.filter(=> $.path has 'node_modules').size()",
    view: "badge",
    data: `
        // vars
        $totalSize: modules.sum(=>output.sizeInBytes);
        $thirdPartySize: modules.filter(=> $.path has 'node_modules').sum(=>output.sizeInBytes);
        // return data
        { prefix: 'Source code: ', text: ($totalSize - $thirdPartySize).formatBytes(), color: 'rgba(148, 111, 234, 0.5)' }`,
  },
  is_dev: {
    when: "transformOptions.dev != null",
    view: "badge",
    data: "{ prefix: '__DEV__: ', text: transformOptions.dev }",
  },
  is_minified: {
    when: "transformOptions.minify != null",
    view: "badge",
    data: "{ prefix: 'Minify: ', text: transformOptions.minify }",
  },
};

const externalLinkHtml = `<svg class="my-icon my-icon-link" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"></path></svg>`;

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
  externalLinkHtml,
  getCopyToClipboardButton,
  getModulesTree,
  getPackage,
  getPackageList,
  getSortableContentFilter,
  getTreeModule,
  metadata,
};
