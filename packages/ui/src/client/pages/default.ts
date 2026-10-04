import {
  getCopyToClipboardButton,
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
    value: parseHashRef() ?? TABS.TREEMAP,
    tabs: [
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
          "text:'Duplicate modules '",
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

        const id = discovery.pageRef ?? TABS.TREEMAP;

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
                .map(=> {path, size: $.output.sizeInBytes})
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
            getCopyToClipboardButton({
              text: "Copy list",
              className: "copy-before-ask-chatgpt",
              textToCopy: `"- " + modules.filter(=> path has "node_modules").group(=> path.getModulesName()).map(=> $.key).join("\\n- ")`,
            }),
            {
              view: "link",
              className: "ask-chatgpt view-button",
              text: "and Ask ChatGPT",
              external: true,
              data: `{
                  href: $.askChatGPTAboutPackages()
                }`,
            },
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
          content: getModulesTree({
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
        },
      ],
    },
  },

  // END
]);
