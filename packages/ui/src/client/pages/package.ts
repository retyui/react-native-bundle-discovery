import {
  getCopyToClipboardButton,
  getPackage,
  getPackageList,
  getTreeModule,
} from "./_common";

discovery.page.define("package", {
  view: "context",
  data: `
    // Tmp variables
    $currentPkgName: #.id;
    ${getPackage(`$pkg: modules.filter(=> path has "node_modules" and path.getModulesName() = $currentPkgName)`)}[0];

    // Return value
    {
      ...$,
      currentPkg: $pkg,
      overview: $.packageOverview($currentPkgName),
      currentPkgImportChain: $.importChain($currentPkgName),
    }
  `,
  content: [
    {
      view: "alert-warning",
      when: "not overview",
      data: "'Package ' + #.id + ' is not found in the bundle'",
    },
    {
      view: "block",
      when: "overview",
      className: "mo-wrap",
      content: [
        { view: "package-overview", data: "overview" },
        getCopyToClipboardButton({
          textToCopy: "#.id",
          className: "mo-copy",
        }),
      ],
    },

    {
      view: "list",
      when: "overview.deprecated",
      data: "overview.deprecated",
      item: {
        view: "alert-danger",
        className: "m-v-8",
        content: [
          "html: '<b>Deprecated</b> '",
          "text: 'v' + version + (#.data.overview.copies.size() > 1 ? ' (' + path + ')' : '') + ': '",
          "text: metadata.deprecated",
        ],
      },
    },

    {
      view: "tabs",
      when: "overview",
      name: "tabs",
      className: "mo-tabs",
      tabs: [
        {
          value: "files",
          content: ["text:'Files '", "pill-badge: overview.filesCount"],
        },
        {
          value: "importers",
          content: ["text:'Imported by '", "pill-badge: overview.importedBy"],
        },
        {
          value: "why",
          when: "currentPkgImportChain",
          text: "Why bundled",
        },
        {
          value: "versions",
          when: "overview.copies.[metadata]",
          content: ["text:'Versions '", "pill-badge: overview.copies.size()"],
        },
      ],
      content: {
        view: "switch",
        content: [
          {
            when: '#.tabs="files"',
            content: getPackageList({
              data: "$.currentPkg",
              itemPkgName: "text: pkgName",
              showCopiesBadge: false,
              expanded: true,
            }),
          },
          {
            when: '#.tabs="importers"',
            content: [
              {
                view: "text",
                className: "why-hint",
                data: "'Modules outside of the package that import its files:'",
              },
              {
                view: "list",
                data: "overview.importers",
                emptyText:
                  "Nothing imports it: the bundler loads it before the app code (e.g. polyfills)",
                item: {
                  view: "tree",
                  expanded: false,
                  itemConfig: {
                    content: [
                      ...getTreeModule(),
                      "pill-badge: imports.size().pluralBadge(['import', 'imports'])",
                    ],
                    children: "imports",
                    itemConfig: {
                      view: "tree-leaf",
                      content: getTreeModule(),
                    },
                  },
                },
              },
            ],
          },
          {
            when: '#.tabs="why"',
            content: {
              view: "block",
              data: "$.currentPkgImportChain",
              className: "why",
              content: [
                {
                  view: "text",
                  className: "why-hint",
                  data: `fromEntry
                    ? 'The shortest import chain from the entry point:'
                    : 'Not imported from the entry point: the bundler runs it before the app code (e.g. polyfills). The shortest chain:'`,
                },
                {
                  view: "list",
                  data: "steps",
                  className: "why-chain",
                  item: {
                    view: "block",
                    className:
                      "=isTarget ? 'why-step why-step-target' : 'why-step'",
                    content: [
                      ...getTreeModule(),
                      {
                        view: "pill-badge",
                        when: "entersPackage",
                        className: "why-enters",
                        data: "{ prefix: 'enters', text: entersPackage, color: 'rgba(0, 170, 255, 0.25)' }",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            when: '#.tabs="versions"',
            content: {
              view: "table",
              data: "overview.copies.[metadata]",
              cols: [
                { header: "Path", content: "text: path" },
                {
                  header: "Version",
                  content: "pill-badge:{ text: 'v' + version, color: '#0af' }",
                },
                {
                  header: "Size",
                  content:
                    "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
                },
                {
                  header: "Published",
                  data: "metadata.createdAt",
                  content: [
                    "text: formatDate()",
                    "text: ' '",
                    "pill-badge:{ text: timeAgo() }",
                  ],
                },
                {
                  header: "Latest",
                  content: [
                    {
                      view: "link",
                      external: true,
                      data: `{
                        href: "https://www.npmjs.com/package/" + #.id + "/v/" + metadata.latestVersion,
                        text: 'v' + metadata.latestVersion,
                      }`,
                    },
                  ],
                },
                {
                  header: "Status",
                  content: {
                    view: "switch",
                    content: [
                      {
                        when: "metadata.deprecated",
                        content: `badge: { text: 'deprecated', color: "rgba(255, 0, 0, 0.35)" }`,
                      },
                      {
                        when: "metadata.isLatest",
                        content: `badge: { text: 'latest', color: "rgba(120, 177, 9, 0.35)" }`,
                      },
                      {
                        content: `badge: { text: 'outdated', color: "rgba(255, 165, 0, 0.35)" }`,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
});
