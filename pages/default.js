const { metadata, getModulesTree } = require("./_common");

const topMetaData = [
  metadata.platform,
  metadata.size,
  metadata.source_code_size,
  metadata.node_modules_size,
  metadata.is_dev,
  metadata.is_minified,
];

const TABS = {
  TREEMAP_FOAMTREE: "treemap-foamtree",
  TREEMAP_HIGHCHARTS: "treemap-highcharts",
  MODULES: "modules",
  PACKAGES: "packages",
  DUPLICATES: "duplicates",
};

discovery.page.define("default", [
  ...topMetaData,

  {
    view: "tabs",
    name: "mainTabs",
    className: "main-tabs",
    value: TABS.PACKAGES, // TODO: change to your tab for development
    tabs: [
      {
        value: TABS.TREEMAP_FOAMTREE,
        text: "Treemap chart",
      },
      {
        value: TABS.TREEMAP_HIGHCHARTS,
        text: "Treemap (#2)",
        when: false,
      },
      {
        value: TABS.MODULES,
        content: ["text:'Moules '", "pill-badge: modules.size()"],
      },
      {
        value: TABS.DUPLICATES,
        content: [
          "text:'Duplicate modules '",
          "pill-badge: modules.filter(=> duplicates).size()",
        ],
      },
      {
        value: TABS.PACKAGES,
        content: [
          "text:'Packages '",
          `pill-badge: modules.filter(=> path has "node_modules").group(=> path.getModulesName(), => 0).size()`,
        ],
      },
    ],
    content: {
      view: "switch",
      content: [
        {
          when: `#.mainTabs="${TABS.TREEMAP_FOAMTREE}"`,
          content: {
            view: "content-filter",
            name: "filterByPathStr",
            // debounce: 300, TODO: https://github.com/discoveryjs/discovery/pull/108
            className: "foamtree-filter",
            content: {
              view: "foamtree",
              data: `
              $root: $.rootFolder;
              $applyFilter: => #.filterByPathStr ? $.modules.filter(=> $.path ~= #.filterByPathStr) : $.modules;
              $dataObject: $.$applyFilter()
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
        },
        {
          when: `#.mainTabs="${TABS.TREEMAP_HIGHCHARTS}"`,
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
          when: `#.mainTabs="${TABS.MODULES}"`,
          content: getModulesTree({
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
                duplicates: $.duplicates.map(=> $.$toModule()),
              })
            `,
          }),
        },
        {
          when: `#.mainTabs="${TABS.PACKAGES}"`,
          content: [
            {
              view: "struct",
              expanded: 3,
              data: `modules.filter(=> path has "node_modules").group(=> path.getModulesName())`,
            },
          ],
        },
        {
          when: `#.mainTabs="${TABS.DUPLICATES}"`,
          content: getModulesTree({
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
          }),
        },
      ],
    },
  },

  // END
]);
