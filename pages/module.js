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
                  className: "foo",
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
                  className: "foo",
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
