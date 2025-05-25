const { metadata, getModulesTree, getTreeModule } = require("./_common");

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

function parseHashRef(url = window.location.href) {
  return new URL(url).hash.split(":")?.[1];
}

discovery.page.define("default", [
  ...topMetaData,

  {
    view: "tabs",
    name: "mainTabs",
    className: "main-tabs",
    value: parseHashRef() ?? TABS.TREEMAP_FOAMTREE,
    tabs: [
      {
        value: TABS.TREEMAP_FOAMTREE,
        text: "Treemap chart",
        className: `main-tabs-${TABS.TREEMAP_FOAMTREE}`,
      },
      {
        value: TABS.TREEMAP_HIGHCHARTS,
        className: `main-tabs-${TABS.TREEMAP_HIGHCHARTS}`,
        text: "Treemap (#2)",
        when: false,
      },
      {
        value: TABS.MODULES,
        className: `main-tabs-${TABS.MODULES}`,
        content: ["text:'Modules '", "pill-badge: modules.size()"],
      },
      {
        value: TABS.DUPLICATES,
        className: `main-tabs-${TABS.DUPLICATES}`,
        content: [
          "text:'Duplicate modules '",
          "pill-badge: modules.filter(=> duplicates).size()",
        ],
      },
      {
        value: TABS.PACKAGES,
        className: `main-tabs-${TABS.PACKAGES}`,
        content: [
          "text:'Packages '",
          `pill-badge: modules.filter(=> path has "node_modules").group(=> path.getModulesName(), => 0).size()`,
        ],
      },
    ],
    content: {
      view: "switch",
      context(data, context) {
        // FIXME
        const isHashChangeEvent = new Error("").stack.includes("Promise.all");
        discovery.overridePageHashStateWithAnchor({
          id: "default",
          ref: isHashChangeEvent ? discovery.pageRef : context.mainTabs,
        });
        discovery.cancelScheduledRender();

        setTimeout(() => {
          discovery.dom.root
            .querySelectorAll(".main-tabs>div>.onclick")
            .forEach((e) => e.classList.remove("active"));
          discovery.dom.root
            .querySelectorAll(`.main-tabs .main-tabs-${discovery.pageRef}`)
            .forEach((e) => e.classList.add("active"));
        }, 50);

        return {
          ...context,
          id: discovery.pageRef,
        };
      },
      content: [
        {
          when: `#.id="${TABS.TREEMAP_FOAMTREE}"`,
          content: {
            view: "content-filter",
            name: "filterByPathStr",
            debounce: 300,
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
          when: `#.id="${TABS.TREEMAP_HIGHCHARTS}"`,
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
          when: `#.id="${TABS.MODULES}"`,
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
          when: `#.id="${TABS.PACKAGES}"`,
          content: [
            {
              view: "content-filter",
              data: `
                $totalSize: modules.output.sizeInBytes.sum();
                $toModule: => {
                  ext:  $.path.getFileExtension(),
                  name: $.path, 
                  size: $.output.sizeInBytes.formatBytes(), 
                  percent: ($.output.sizeInBytes / $totalSize).percent(3),
                };
                modules
                   .filter(=> path has "node_modules")
                   .group(=> path.getModulesName())
                   .map(=> ({ 
                      $pkgName: $.key;
                      pkgName: $pkgName,
                      size: $.value.map(=> output.sizeInBytes).sum(),
                      pkgInstances: $.value
                        .group(=> path.split($pkgName).pick(0) + $pkgName)
                        .map(=> {
                           pkgName: $.key,
                           size: $.value.map(=> output.sizeInBytes).sum(),
                           modules: $.value.map(=> $.$toModule()),
                        }),
                   }))
                   .sort(size desc)
              `,
              name: "filterByPathStr",
              content: {
                view: "list",
                data: ".[pkgName ~= #.filterByPathStr]",
                emptyText: "⚠️ No packages found",
                item: {
                  view: "tree",
                  expanded: false,
                  itemConfig: {
                    content: [
                      {
                        view: "link",
                        content: "text-match",
                        data: `{
                          href: pkgName.pageLink("package", {}),
                          text: pkgName,
                          match: #.filterByPathStr
                        }`,
                      },
                      "text: ' '",
                      "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
                      {
                        view: "pill-badge",
                        when: "pkgInstances.size() > 1",
                        text: "has duplicates",
                        color: "rgba(255, 0, 0, 0.35)",
                      },
                    ],
                    children: `$.pkgInstances`,
                    itemConfig: {
                      view: "tree-leaf",
                      content: [
                        //
                        "text:pkgName",
                        "text:' '",
                        "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
                      ],
                      children: `$.modules`,
                      itemConfig: {
                        view: "tree-leaf",
                        content: getTreeModule(),
                      },
                    },
                  },
                },
              },
            },
          ],
        },
        {
          when: `#.id="${TABS.DUPLICATES}"`,
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
