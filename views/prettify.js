discovery.view.define(
  "source-prettify",
  async function renderPrettify(el, config, data, context) {
    await this.render(
      el,
      this.composeConfig([
        {
          ...config,
          source: await config.source,
          view: "source",
        },
      ]),
      data,
      context,
    );
  },
);
