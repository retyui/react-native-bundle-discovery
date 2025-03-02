const platformColor = `transformOptions.platform = 'android' ? 'rgba(194, 239, 116, .4)' : 'rgba(119, 31, 218, .4)'`;

function getTreeModule({ hasTextMatch = false } = {}) {
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
    "pill-badge:{ text: size, color: 'rgba(120, 177, 9, 0.35)' }",
    "pill-badge:{ text: percent, color: 'rgba(120, 177, 9, 0.35)' }",
  ];
}
function getModulesTree({ data }) {
  if (!data) {
    throw new Error("[getModulesTree]: data is required");
  }
  return {
    view: "content-filter",
    data,
    name: "filterByPathStr",
    content: {
      view: "list",
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
                 title:'Dependents',
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
                  content: "text:title",
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
                  content: "text:title",
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
    data: `{ prefix: 'Size: ', text: modules.output.sizeInBytes.sum().formatBytes(), color: ${platformColor} }`,
  },
  node_modules_size: {
    when: "modules.filter(=> $.path has 'node_modules').size()",
    view: "badge",
    data: "{ prefix: 'node_modules: ', text: modules.filter(=> $.path has 'node_modules').output.sizeInBytes.sum().formatBytes(), color: 'rgba(255, 0, 0, 0.35)' }",
  },
  source_code_size: {
    when: "modules.filter(=> $.path has 'node_modules').size()",
    view: "badge",
    data: `
        // vars
        $totalSize: modules.output.sizeInBytes.sum();
        $thirdPartySize: modules.filter(=> $.path has 'node_modules').output.sizeInBytes.sum();
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

module.exports = {
  getTreeModule,
  getModulesTree,
  metadata,
};
