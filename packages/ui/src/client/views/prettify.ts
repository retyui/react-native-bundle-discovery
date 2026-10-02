// `this` is the view render context created by discovery.js
interface RenderContext {
  render: typeof discovery.view.render;
  composeConfig(config: unknown): DiscoveryRawViewConfig;
}

discovery.view.define(
  "source-prettify",
  async function renderPrettify(
    this: RenderContext,
    el,
    config,
    data,
    context,
  ) {
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
