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
      // value: "networkGraph", //FIXME
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
              modifiers: [
                "html: '<br/>'",
                "text:'Max parent depth: '",
                {
                  view: "input",
                  name: "maxParentDepth",
                  className: "inline-block",
                  htmlType: "number",
                  value: 2,
                  htmlMin: 1,
                  htmlMax: 10,
                },
              ],
              content: [
                {
                  view: "context",
                  data: `{
                    // Vars
                    $tmp: $.currentModule.getNetworkGraph({ maxParentDepth: #.maxParentDepth });
                    // Return data
                    currentModulePath: $.currentModule.path,
                    entryPointPath: $tmp.entryPointPath,
                    data: $tmp.data,
                    isGraphTooBig: $tmp.data.size() > 666,
                  }`,
                  content: [
                    // TODO use for debugging
                    // {
                    //   view: "struct",
                    //   expanded: 2,
                    // },
                    {
                      when: "isGraphTooBig",
                      view: "block",
                      content: [
                        "html: '<br/>'",
                        {
                          view: "alert-warning",
                          data: '"Amount of dependencies ("+$.data.size()+") are too big to display :("',
                        },
                      ],
                    },
                    {
                      when: "not isGraphTooBig",
                      view: "highcharts",
                      data: `{
                        options: {
                          chart: {
                            type: "networkgraph",
                            height: "500px",
                          },
                          title: {
                            text: "Import Dependency Graph",
                            align: "center",
                          },
                          subtitle: {
                            text: "It shows which modules import this file (Red - current module, Gold - entry point)",
                            align: "center",
                          },
                          plotOptions: {
                            networkgraph: {
                              keys: ["from", "to"],
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
                              ].filter(=> id),
                            },
                          ],
                        },
                      }`,
                    },
                  ],
                },
              ],
            },
          },
          {
            when: '#.tabs="mduplicates"',
            content: {
              view: "struct", // TODO
              expanded: 2,
              data: "currentModule.duplicates",
            },
          },
        ],
      },
    },
  ],
});
