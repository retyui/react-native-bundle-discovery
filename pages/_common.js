const platformColor = `transformOptions.platform = 'android' ? 'rgba(194, 239, 116, .4)' : 'rgba(119, 31, 218, .4)'`;

function getPackage(entry) {
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
          .group(=> path.split($pkgName).pick(0) + $pkgName)
          .map(=> {
             $pkgNameWithPath: $.key;
             pkgName: $pkgNameWithPath, // example: node_modules/lodash
             version: $packages.[path = $pkgNameWithPath][0].version,
             size: $.value.sum(=> output.sizeInBytes),
             modules: $.value.map(=> $.$toModule()),
          }),
     }))`;
}

function getPackageList({
  data,
  itemPkgName,
  showCopiesBadge,
  expanded,
  limit,
  subLimit,
}) {
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
            "pill-badge:{ text: 'v' + version, color: '#0af' }",
            "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
            {
              view: "pill-badge",
              data: "modules.size().pluralBadge(['file','files'])",
            },
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

function getTreeModule({ hasTextMatch = false, hasPercent = false } = {}) {
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
  ].filter(Boolean);
}
function getModulesTree({ data, limit }) {
  if (!data) {
    throw new Error("[getModulesTree]: data is required");
  }
  return {
    view: "content-filter",
    data,
    name: "filterByPathStr",
    content: {
      view: "list",
      limit,
      data: ".[name ~= #.filterByPathStr]",
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
    },
  };
}

const metadata = {
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

function getCopyToClipboardButton({ textToCopy, className, text }) {
  return {
    view: "button",
    className: `${className ?? ""} copy-to-clipboard`,
    text,
    data: `{ textToCopy: ${textToCopy} }`,
    onClick(elm, data) {
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

module.exports = {
  getCopyToClipboardButton,
  getPackage,
  getPackageList,
  externalLinkHtml,
  getTreeModule,
  getModulesTree,
  metadata,
};
