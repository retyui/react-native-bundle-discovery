discovery.page.define("default", [
  {
    view: "page-header",
    content: {
      view: "h1",
      data: "#.model.name",
    },
  },
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
]);
