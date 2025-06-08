const { externalLinkHtml } = require("./_common.js");
const { getTreeModule } = require("./_common");

discovery.page.define("package", {
  view: "context",
  data: `
    // Tmp variables
    $currentPkgName: #.id;
    $packages: $.packages;
    $toModule: => {
      ext:  $.path.getFileExtension(),
      name: $.path, 
      size: $.output.sizeInBytes.formatBytes(),
    };
    $pkg: modules
       .filter(=> path has "node_modules" and path has $currentPkgName)
       .group(=> path.getModulesName())
       .map(=> ({ 
          $pkgName: $.key;
          pkgName: $pkgName, // example: lodash
          size: $.value.map(=> output.sizeInBytes).sum(),
          pkgInstances: $.value
            .group(=> path.split($pkgName).pick(0) + $pkgName)
            .map(=> {
               $pkgNameWithPath: $.key;
               pkgName: $pkgNameWithPath, // example: node_modules/lodash
               version: $packages.[path = $pkgNameWithPath][0].version,
               size: $.value.map(=> output.sizeInBytes).sum(),
               modules: $.value.map(=> $.$toModule()),
            }),
       }))[0];
   
    // Return value
    { 
    ...$, 
    currentPkgHasCopies: $pkg.pkgInstances.size() > 1,
    currentPkgCopiesCount: $pkg.pkgInstances.size() - 1,
    currentPkgVersion: $pkg.pkgInstances[0].version,
    currentPkgWithUniqVer: $pkg.pkgName + ($pkg.pkgInstances.size() = 1 ? '@' + $pkg.pkgInstances[0].version : ''),
    
    currentPkg: $pkg,
  }`,
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
          content: [
            `badge: {
              text: $.currentPkgWithUniqVer,
              color: "#fffb5a",
            }`,
          ],
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
          data: `{ href: "https://www.npmjs.com/package/" + currentPkg.pkgName }`,
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
      ],
    },

    "html: '<hr>'",

    {
      view: "block",
      content: [
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
                  content: getTreeModule(),
                },
              },
            },
          },
        },
      ],
    },
  ],
});
