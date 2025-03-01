const { metadata, getModulesTree } = require("./_common");

const topMetaData = [
  metadata.platform,
  metadata.size,
  metadata.source_code_size,
  metadata.node_modules_size,
  metadata.is_dev,
  metadata.is_minified,
];

discovery.page.define("default", [
  ...topMetaData,

  {
    view: "tabs",
    name: "mainTabs",
    className: "main-tabs",
    value: "modules", // TODO: change to your tab for development
    tabs: [
      {
        value: "treemap-foamtree",
        text: "Treemap chart",
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
          when: '#.mainTabs="duplicates"',
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
