const { metadata } = require("./_common");

const topMetaData = [
  metadata.platform,
  metadata.size,
  metadata.source_code_size,
  metadata.node_modules_size,
  metadata.is_dev,
  metadata.is_minified,
];

const getTreeModule = ({ hasTextMatch = false } = {}) => [
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
  "pill-badge:{ text: ext, color: 'rgba(237, 177, 9, 0.35)' }",
];

discovery.page.define("default", [
  ...topMetaData,

  {
    view: "tabs",
    name: "mainTabs",
    className: "main-tabs",
    value: "duplicates", // TODO: change to your tab for development
    tabs: [
      {
        value: "treemap-foamtree",
        text: "Treemap graph",
      },
      {
        value: "treemap-highcharts",
        text: "Treemap (#2)",
        when: false,
      },
      {
        value: "modules",
        content: ["text:'Modules '", "pill-badge: modules.size()"],
      },
      {
        value: "duplicates",
        content: [
          "text:'Duplicate modules '",
          "pill-badge: modules.filter(=> duplicates).size()",
        ],
      },
    ],
    content: {
      view: "switch",
      content: [
        {
          when: '#.mainTabs="treemap-foamtree"',
          content: {
            view: "foamtree",
            data: `
              $root: $.rootFolder;
              $dataObject: modules
                //.slice(0,9999999)
                .map(=> {path, size: $.output.sizeInBytes})
                .transformFilesList($root, "foamtree");
          
              {
                options: { 
                  dataObject: $dataObject,
                  descriptionGroupSize: 0.05,
                  descriptionGroupMinHeight: 30,
                }
              }
              `,
          },
        },
        {
          when: '#.mainTabs="treemap-highcharts"',
          content: {
            view: "highcharts",
            data: `
              $root: $.rootFolder;
              $myData: modules
                //.slice(0,9999999)
                .map(=> {path, size: $.output.sizeInBytes})
                .transformFilesList($root, "highcharts-treemap");
              
              {
                options: {
                  title: undefined,
                  chart: {
                    height: 700, // Set height in pixels
                  },
                  series: [
                    {
                      name: "Regions",
                      type: "treemap",
                      layoutAlgorithm: "squarified",
                      allowDrillToNode: true,
                      animationLimit: 1000,
                      dataLabels: { enabled: false },
                      levels: [
                        {
                          level: 1,
                          dataLabels: { enabled: true },
                          borderWidth: 3,
                          levelIsConstant: false,
                        },
                        { level: 1, dataLabels: { style: { fontSize: "14px" } } },
                      ],
                      data: $myData,
                    },
                  ],
                },
              }`,
          },
        },
        {
          when: '#.mainTabs="modules"',
          content: {
            view: "content-filter",
            data: `
              $totalSize: modules.output.sizeInBytes.sum();
              $toModule: => {
                ext:  $.path.getFileExtension(),
                name: $.path, 
                size: $.output.sizeInBytes.formatBytes(), 
                percent: ($.output.sizeInBytes / $totalSize).percent(3),
              };
              modules.map(=> { 
                ...$.$toModule(),
                reasons: $.dependents.map(=> $.$toModule()),
              })
            `,
            name: "filterByPathStr",
            content: {
              view: "list",
              data: ".[name ~= #.filterByPathStr]",
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
                    ],
                  },
                },
              },
            },
          },
        },
        {
          when: '#.mainTabs="duplicates"',
          content: {
            view: "content-filter",
            data: `
              // values
              $duplicatesOnly: modules.filter(=> duplicates);
              $totalSize: $duplicatesOnly.output.sizeInBytes.sum();
              $toModule: => {
                ext:  $.path.getFileExtension(),
                name: $.path, 
                size: $.output.sizeInBytes.formatBytes(), 
                percent: ($.output.sizeInBytes / $totalSize).percent(3),
              };
              // return
              $duplicatesOnly.map(=> { 
                ...$.$toModule(),
                reasons: $.dependents.map(=> $.$toModule()),
                duplicates: $.duplicates.map(=> $.$toModule()),
              })
            `,
            name: "filterByPathStr",
            content: {
              view: "list",
              data: ".[name ~= #.filterByPathStr]",
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
          },
        },
      ],
    },
  },

  // END
]);
