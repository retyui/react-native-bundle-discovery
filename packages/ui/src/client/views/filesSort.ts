// `this` is the view render context created by discovery.js
interface RenderContext {
  renderList: typeof discovery.view.renderList;
  listLimit: typeof discovery.view.listLimit;
}

type FilesSortOrder = "desc" | "asc" | null;

const LABELS = {
  desc: "↓ largest first",
  asc: "↑ smallest first",
  unset: "⇅ sort by size",
};

// "Size" toggle on a package instance tree leaf: unset -> desc -> asc -> unset.
// Re-renders the files (children) of that leaf with `fileConfig`.
discovery.view.define(
  "files-sort",
  function renderFilesSort(this: RenderContext, el, config, data, context) {
    const { fileConfig, limit } = config;
    const modules: { sizeInBytes: number }[] = data.modules;
    let order: FilesSortOrder = null;

    const button = el.appendChild(document.createElement("button"));
    button.type = "button";
    button.className = "files-sort-button";
    button.textContent = LABELS.unset;
    button.title = "Sort files by size";

    button.addEventListener("click", () => {
      order = order === null ? "desc" : order === "desc" ? "asc" : null;
      button.textContent = LABELS[order ?? "unset"];
      button.classList.toggle("checked", order !== null);

      const childrenEl = button
        .closest(".view-tree-leaf")
        ?.querySelector<HTMLElement>(":scope > .view-tree-leaf-children");
      if (!childrenEl) {
        return;
      }

      const files = order
        ? [...modules].sort((a, b) =>
            order === "desc"
              ? b.sizeInBytes - a.sizeInBytes
              : a.sizeInBytes - b.sizeInBytes,
          )
        : modules;

      childrenEl.replaceChildren();
      this.renderList(
        childrenEl,
        fileConfig,
        files,
        context,
        0,
        this.listLimit(limit, 25),
      );
    });
  },
);
