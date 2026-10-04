import {
  getInsightsTab,
  getModulesTree,
  getPackage,
  getPackageList,
  getSortableContentFilter,
  metadata,
} from "./_common";

const topMetaData = [
  metadata.platform,
  metadata.size,
  metadata.source_code_size,
  metadata.node_modules_size,
  metadata.is_dev,
  metadata.is_minified,
];

const TABS = {
  INSIGHTS: "insights",
  TREEMAP: "treemap",
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
    value: parseHashRef() ?? TABS.INSIGHTS,
    tabs: [
      {
        value: TABS.INSIGHTS,
        className: `main-tabs-${TABS.INSIGHTS}`,
        content: [
          "text:'Insights '",
          {
            view: "pill-badge",
            when: "recommendations",
            data: "recommendations.size()",
          },
        ],
      },
      {
        value: TABS.TREEMAP,
        text: "Treemap chart",
        className: `main-tabs-${TABS.TREEMAP}`,
      },
      {
        value: TABS.PACKAGES,
        className: `main-tabs-${TABS.PACKAGES}`,
        content: [
          "text:'Packages '",
          `pill-badge: modules.filter(=> path has "node_modules").group(=> path.getModulesName(), => 0).size()`,
        ],
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
          "text:'Duplicates '",
          "pill-badge: modules.filter(=> duplicates).size()",
        ],
      },
    ],
    content: {
      view: "switch",
      context(_data: unknown, context: { mainTabs: string }) {
        // FIXME - common nobody handle navigation in such way :(
        const isHashChangeEvent = (new Error("").stack as string).includes(
          "Promise.all",
        );
        discovery.overridePageHashStateWithAnchor({
          id: "default",
          ref: isHashChangeEvent ? discovery.pageRef : context.mainTabs,
        });
        discovery.cancelScheduledRender();

        const id = discovery.pageRef ?? TABS.INSIGHTS;

        setTimeout(() => {
          discovery.dom.root
            .querySelectorAll(".main-tabs>div>.onclick")
            .forEach((e) => {
              e.classList.remove("active");
            });
          discovery.dom.root
            .querySelectorAll(`.main-tabs .main-tabs-${id}`)
            .forEach((e) => {
              e.classList.add("active");
            });
        }, 50);

        return {
          ...context,
          id,
        };
      },
      content: [
        {
          when: `#.id="${TABS.INSIGHTS}"`,
          content: getInsightsTab(),
        },
        {
          when: `#.id="${TABS.TREEMAP}"`,
          content: {
            view: "content-filter",
            name: "filterByPathStr",
            debounce: 300,
            className: "treemap-filter",
            content: {
              view: "treemap",
              data: `
              $root: $.rootFolder;
              $applyFilter: => #.filterByPathStr ? $.modules.filter(=> $.path ~= #.filterByPathStr) : $.modules;
              $.$applyFilter()
                .map(=> {path, size: $.output.sizeInBytes, issues})
                .transformFilesList($root, "treemap")
              `,
            },
          },
        },
        {
          when: `#.id="${TABS.MODULES}"`,
          content: getModulesTree({
            limit: 200,
            sortable: true,
            data: `
              $entryPoint: $.entryPointPath;
              $totalSize: modules.sum(=>output.sizeInBytes);
              $toModule: => {
                ext:  $.path.getFileExtension(),
                name: $.path, 
                size: $.output.sizeInBytes.formatBytes(), 
                percent: ($.output.sizeInBytes / $totalSize).percent(3),
              };
              modules.map(=> { 
                ...$.$toModule(),
                sizeInBytes: $.output.sizeInBytes,
                isEntry: $.isEntry,
                reasons: $.dependents.map(=> $.$toModule()),
                duplicates: $.duplicates.map(=> $.$toModule()),
              })
            `,
          }),
        },
        {
          when: `#.id="${TABS.PACKAGES}"`,
          content: [
            getSortableContentFilter({
              data: getPackage(`modules.filter(=> path has "node_modules")`),
              className: "packages-content",
              nameField: "pkgName",
              sizeField: "size",
              duplicatesCount: "(pkgInstances.size() - 1)",
              defaultSort: "pkgInstances desc, size desc",
              content: (listData) =>
                getPackageList({
                  showCopiesBadge: true,
                  expanded: false,
                  limit: 200,
                  subLimit: 50,
                  data: listData,
                  itemPkgName: {
                    view: "link",
                    content: "text-match",
                    data: `{
                          href: pkgName.pageLink("package", {}),
                          text: pkgName,
                          match: #.filterByPathStr
                        }`,
                  },
                }),
            }),
          ],
        },
        {
          when: `#.id="${TABS.DUPLICATES}"`,
          content: {
            view: "block",
            className: "tab-scroll",
            data: `
              $allPackages: (${getPackage(`modules.filter(=> path has "node_modules")`)});
              {
                ...$,
                duplicatePackages: $allPackages
                  .[pkgInstances.size() > 1]
                  // Keeping only the heaviest copy saves the rest
                  .({ ...$, savings: size - pkgInstances.sort(size desc)[0].size })
                  .sort(savings desc),
              }
            `,
            content: [
              {
                view: "h3",
                className: "dup-title",
                content: [
                  "text: 'Duplicate packages '",
                  "pill-badge: duplicatePackages.size()",
                  {
                    view: "pill-badge",
                    when: "duplicatePackages",
                    data: "{ text: '~' + duplicatePackages.sum(=> savings).formatBytes(), postfix: 'can be saved', color: 'rgba(120, 177, 9, 0.35)' }",
                  },
                ],
              },
              {
                view: "context",
                when: "duplicatePackages",
                content: getPackageList({
                  showCopiesBadge: true,
                  expanded: false,
                  data: "duplicatePackages",
                  itemPkgName: {
                    view: "link",
                    data: `{ href: pkgName.pageLink("package", {}), text: pkgName }`,
                  },
                }),
              },
              {
                view: "text",
                when: "not duplicatePackages",
                className: "dup-empty",
                data: "'✅ Every package is bundled only once'",
              },
              {
                view: "h3",
                className: "dup-title",
                content: [
                  "text: 'Duplicate modules '",
                  "pill-badge: modules.filter(=> duplicates).size()",
                ],
              },
              getModulesTree({
                data: `
              // values
              $duplicatesOnly: modules.filter(=> duplicates);
              $totalSize: $duplicatesOnly.sum(=>output.sizeInBytes);
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
            ],
          },
        },
      ],
    },
  },

  // END
]);
