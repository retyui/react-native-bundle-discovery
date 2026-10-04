// `this` is the view render context created by discovery.js
interface RenderContext {
  render: typeof discovery.view.render;
}

// Values are kept in memory, so a filter survives navigating to
// a package/module page and back (the page is re-rendered from scratch)
const persistedValues = new Map<string, string>();

// Same as a regexp "input", but remembers the entered value by `persistKey`
discovery.view.define(
  "persisted-filter-input",
  async function renderPersistedFilterInput(
    this: RenderContext,
    el,
    config,
    data,
    context,
  ) {
    const { persistKey, onChange, ...rest } = config;
    let inputEl: HTMLInputElement | null = null;

    await this.render(
      el,
      {
        ...rest,
        view: "input",
        type: "regexp",
        value: persistedValues.get(persistKey) ?? "",
        onChange(value: unknown, name: string) {
          persistedValues.set(persistKey, inputEl?.value.trim() ?? "");
          onChange?.(value, name);
        },
      },
      data,
      context,
    );

    // `el` is a fragment (`tag: false`), grab the input before it's mounted
    inputEl = el.querySelector("input");
  },
  // no wrapper element, so `.packages-content > .view-input` styles still apply
  // (cast: discovery.js typings require all options here)
  { tag: false } as never,
);
