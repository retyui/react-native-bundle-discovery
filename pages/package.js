const { externalLinkHtml } = require("./_common.js");
const {
  getTreeModule,
  getPackage,
  getPackageList,
  getCopyToClipboardButton,
} = require("./_common");

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
        getCopyToClipboardButton({
          textToCopy: `$.currentPkg.pkgName`,
          className: "m-l-0_5em",
        }),
      ],
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
