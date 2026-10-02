import {
  externalLinkHtml,
  getCopyToClipboardButton,
  getPackage,
  getPackageList,
} from "./_common";

discovery.page.define("package", {
  view: "context",
  data: `
    // Tmp variables
    $currentPkgName: #.id;
    ${getPackage(`$pkg: modules.filter(=> path has "node_modules" and path has $currentPkgName)`)}[0];
    $copies: $pkg.pkgInstances.size() - 1;
    $ver: $pkg.pkgInstances[0].version;

    // Return value
    { 
      ...$, 
      currentPkgHasCopies: $copies > 0,
      currentPkgCopiesCount: $copies,
      currentPkgVersion: $ver,
      currentPkgWithUniqVer: $pkg.pkgName + ($copies = 0 ? '@' + $ver : ''),
      currentPkgWithUniqVerNpm: $pkg.pkgName + ($copies = 0 ? '/v/' + $ver : ''),
      currentPkg: $pkg,
      currentPkgInstancesWithMetadata: $pkg.pkgInstances.[metadata],
      currentPkgDeprecated: $pkg.pkgInstances.[metadata.deprecated],
      currentPkgOutdated: $pkg.pkgInstances.[metadata and not metadata.isLatest],
      currentPkgLatestVersion: $pkg.pkgInstances.metadata.latestVersion[0],
    }
  `,
  content: [
    // TODO uncomment for debugging
    // {
    //   view: "struct",
    //   data: "$.currentPkg",
    // },

    {
      view: "block",
      content: [
        {
          view: "h1",
          className: "inline-block no-margin",
          content: `badge: {
            text: $.currentPkgWithUniqVer,
            color: "#fffb5a",
          }`,
        },
        {
          when: "$.currentPkgCopiesCount > 0",
          view: "h2",
          className: "inline-block no-margin",
          content: [
            `badge: {
              text: '+' + $.currentPkgCopiesCount, 
              postfix: $.currentPkgCopiesCount = 1 ? 'copy' : 'copies',
              color: "rgba(255, 0, 0, 0.35)"
            }`,
          ],
        },
        {
          when: "$.currentPkgDeprecated",
          view: "h2",
          className: "inline-block no-margin",
          content: `badge: { text: 'deprecated', color: "rgba(255, 0, 0, 0.35)" }`,
        },
        {
          when: "$.currentPkgOutdated",
          view: "h2",
          className: "inline-block no-margin",
          content: `badge: {
            prefix: 'latest',
            text: 'v' + $.currentPkgLatestVersion,
            color: "rgba(255, 165, 0, 0.35)"
          }`,
        },
        getCopyToClipboardButton({
          textToCopy: `$.currentPkg.pkgName`,
          className: "m-l-0_5em",
        }),
      ],
    },

    {
      when: "$.currentPkgDeprecated",
      view: "list",
      data: "$.currentPkgDeprecated",
      item: {
        view: "alert-danger",
        content: [
          "html: '<b>Deprecated</b> '",
          "text: 'v' + version + (#.data.currentPkgHasCopies ? ' (' + pkgName + ')' : '') + ': '",
          "text: metadata.deprecated",
        ],
      },
    },

    "html: '<br>'",

    {
      view: "block",
      content: [
        "text: 'Links: '",
        {
          view: "link",
          external: true,
          data: `{ href: "https://www.npmjs.com/package/" + currentPkgWithUniqVerNpm }`,
          content: [
            "text: 'npmjs.com'",
            `html: '<span class="my-icon-inline my-icon-12">${externalLinkHtml}</span>'`,
          ],
        },
        "text: ' '",
        {
          view: "link",
          external: true,
          data: `{ href: "https://bundlephobia.com/package/" + currentPkgWithUniqVer }`,
          content: [
            "text: 'bundlephobia.com'",
            `html: '<span class="my-icon-inline my-icon-12">${externalLinkHtml}</span>'`,
          ],
        },
        "text: ' '",
        {
          view: "link",
          external: true,
          data: `{ href: "https://packagephobia.com/result?p=" + currentPkgWithUniqVer }`,
          content: [
            "text: 'packagephobia.com'",
            `html: '<span class="my-icon-inline my-icon-12">${externalLinkHtml}</span>'`,
          ],
        },
        {
          view: "link",
          external: true,
          data: `{ href: "https://bundlejs.com/?q=" + currentPkgWithUniqVer, q: currentPkgWithUniqVer }`,
          content: [
            {
              view: "html",
              data: `'<img class="bundlejs-badge-img" src="https://deno.bundlejs.com/?q=' + q + '&badge=detailed" />'`,
            },
          ],
        },
      ],
    },

    {
      when: "$.currentPkgInstancesWithMetadata",
      view: "block",
      content: [
        "h3: 'Versions'",
        {
          view: "table",
          data: "$.currentPkgInstancesWithMetadata",
          cols: [
            { header: "Path", content: "text: pkgName" },
            {
              header: "Version",
              content: "pill-badge:{ text: 'v' + version, color: '#0af' }",
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
                    href: "https://www.npmjs.com/package/" + #.data.currentPkg.pkgName + "/v/" + metadata.latestVersion,
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
      ],
    },

    "html: '<hr>'",

    {
      view: "block",
      content: getPackageList({
        data: "$.currentPkg",
        itemPkgName: "text: pkgName",
        showCopiesBadge: false,
        expanded: true,
      }),

      /*[
        {
          view: "list",
          data: "$.currentPkg",
          item: {
            view: "tree",
            expanded: true,
            itemConfig: {
              content: [
                "text: pkgName",
                "text: ' '",
                "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
              ],
              children: `$.pkgInstances`,
              itemConfig: {
                view: "tree-leaf",
                content: [
                  //
                  "text:pkgName",
                  "text:' '",
                  "pill-badge:{ text: 'v' + version, color: '#0af' }",
                  "pill-badge:{ text: size.formatBytes(), color: 'rgba(120, 177, 9, 0.35)' }",
                ],
                children: `$.modules`,
                itemConfig: {
                  view: "tree-leaf",
                  content: getTreeModule({ hasPercent: false }),
                },
              },
            },
          },
        },
      ]*/
    },
  ],
});
