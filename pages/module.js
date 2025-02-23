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

    "h4: 'Module content'",
    {
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
  ],
});
