const { metadata } = require("./_common");

discovery.page.define("module", {
  view: "context",
  data: `{ ...$, currentModule: $.modules.[path = #.id].pick(0) }`,
  content: [
    {
      view: "h2",
      content: [
        //
        'text: "Module: "',
        "text: $.currentModule.path",
      ],
    },

    {
      view: "tabs",
      name: "tabs",
      tabs: [
        {
          value: "mcontent",
          text: "Module content",
        },
        {
          value: "networkGraph",
          text: "Dependent modules",
        },
        {
          value: "mduplicates",
          when: "currentModule.duplicates",
          text: "Duplicates",
        },
      ],
      content: {
        view: "switch",
        content: [
          {
            when: '#.tabs="mcontent"',
            content: {
              view: "hstack",
              className: "flex-no-wrap",
              content: [
                {
                  view: "block",
                  className: "width-50p",
                  content: [
                    "h5: 'Source'",
                    {
                      view: "source",
                      syntax: "ts",
                      source: "=$.currentModule.source.code",
                    },
                  ],
                },
                {
                  view: "block",
                  className: "width-50p",
                  content: [
                    "h5: 'Output'",
                    {
                      view: "source",
                      syntax: "ts",
                      source: "=$.currentModule.output.code",
                    },
                  ],
                },
              ],
            },
          },
          {
            when: '#.tabs="networkGraph"',
            content: {
              view: "context",
              data: `{
                $tmp: $.currentModule.getNetworkGraph();
                // 
                currentModulePath: $.currentModule.path,
                entryPointPath: $tmp.entryPointPath,
                data: $tmp.data,
              }`,
              content: {
                when: "$.data.size() < 100",
                view: "highcharts",
                data: `{
                  options: {
                    chart: {
                      type: "networkgraph",
                      height: "600px",
                    },
                    title: {
                      text: "Import Dependency Graph",
                      align: "left",
                    },
                    subtitle: {
                      text: "It shows which modules import this file (Red - current module, Gold - entry point)",
                      align: "left",
                    },
                    plotOptions: {
                      networkgraph: {
                        keys: ["to", "from"],
                        //keys: ["from", "to"],
                        layoutAlgorithm: {
                          enableSimulation: true,
                          friction: -0.9,
                          gravitationalConstant: 0.06,
                        },
                      },
                    },
                    series: [
                      {
                        accessibility: {
                          enabled: false,
                        },
                        dataLabels: {
                          enabled: true,
                          linkFormat: "",
                          style: {
                            fontSize: "0.8em",
                            fontWeight: "normal",
                          },
                        },
                        id: "lang-tree",
                        data: $.data,
                        nodes:[
                          { id: $.currentModulePath, marker: { radius: 15, fillColor: 'red' }, },
                          { id: $.entryPointPath, marker: { radius: 15, fillColor: 'gold' } }
                        ],
                      },
                    ],
                  },
                }`,
              },
            },
          },
          {
            when: '#.tabs="mduplicates"',
            content: {
              view: "table", // TODO
              data: "currentModule.duplicates",
            },
          },
        ],
      },
    },
  ],
});
