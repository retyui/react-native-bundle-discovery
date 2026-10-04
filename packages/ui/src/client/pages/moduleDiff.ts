import { getModulePage } from "./_module";

// Module page in compare mode: the code tab diffs the module with the "before" report
discovery.page.define(
  "module-diff",
  getModulePage({
    codeTabText: "Diff",
    extraData: "before: $.comparison.beforeModules[#.id],",
    codeContent: {
      view: "switch",
      content: [
        {
          when: "not before",
          content: {
            view: "alert-warning",
            data: "'This module was not changed compared with the \"before\" report'",
          },
        },
        {
          content: {
            view: "hstack",
            className: "flex-no-wrap",
            content: [
              {
                view: "block",
                when: "not isImageOrFontAsset",
                className: "width-50p",
                content: [
                  {
                    view: "h5",
                    className: "mo-pane-title",
                    content: "text: 'Source diff'",
                  },
                  {
                    view: "code-diff",
                    data: "{ before: before.source, after: currentModule.source.code }",
                  },
                ],
              },
              {
                view: "block",
                className: (data: { isImageOrFontAsset: boolean }) =>
                  data.isImageOrFontAsset ? "" : "width-50p",
                content: [
                  {
                    view: "h5",
                    className: "mo-pane-title",
                    content: "text: 'Output diff'",
                  },
                  {
                    view: "context",
                    modifiers: [
                      {
                        view: "checkbox",
                        name: "prettify",
                        checked: true,
                        className: "prettify-checkbox",
                        content: 'text:"Prettify"',
                      },
                    ],
                    content: {
                      view: "code-diff",
                      data: `#.prettify
                        ? { before: before.output.prettifyJS(), after: currentModule.output.code.prettifyJS() }
                        : { before: before.output, after: currentModule.output.code }`,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  }),
);
