discovery.page.define("default", [
  {
    view: "page-header",
    content: [
      {
        view: "h1",
        className: "inline-block",
        data: "'<tool-name>'",
      },
      "html:'<br/>'",
      {
        when: "transformOptions.platform",
        view: "badge",
        data: "{ prefix: 'Platform: ', text: transformOptions.platform }",
      },
      {
        when: "transformOptions.dev != null",
        view: "badge",
        data: "{ prefix: '__DEV__: ', text: transformOptions.dev }",
      },
      {
        when: "transformOptions.minify != null",
        view: "badge",
        data: "{ prefix: 'Minify: ', text: transformOptions.minify }",
      },
      {
        when: "modules.filter(=> $.path has 'node_modules').size()",
        view: "badge",
        data: "{ prefix: 'Size: ', text: modules.output.sizeInBytes.sum().formatBytes() }",
      },
      {
        when: "modules.filter(=> $.path has 'node_modules').size()",
        view: "badge",
        data: "{ prefix: 'Third-party modules: ', text: modules.filter(=> $.path has 'node_modules').output.sizeInBytes.sum().formatBytes() }",
      },
      {
        when: "modules.filter(=> $.path has 'node_modules').size()",
        view: "badge",
        data: `
        // vars
        $totalSize: modules.output.sizeInBytes.sum();
        $thirdPartySize: modules.filter(=> $.path has 'node_modules').output.sizeInBytes.sum();
        // return data
        { prefix: 'Source code: ', text: ($totalSize - $thirdPartySize).formatBytes() }`,
      },
    ],
  },

  {
    view: "foamtree",
    when: true,
    data: `
    $root: $.monorepoRoot;
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

  {
    when: false,
    view: "highcharts",
    data: `
    $root: $.monorepoRoot;
    $myData: modules
      //.slice(0,9999999)
      .map(=> {path, size: $.output.sizeInBytes})
      .transformFilesList($root, "highcharts-treemap");
    
    {
      options: {
        title: {
          text: "Contents of the bundle",
          align: "left",
        },
        chart: {
          height: 600, // Set height in pixels
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

  // END
]);
