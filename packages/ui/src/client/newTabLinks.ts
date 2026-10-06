// Let Cmd/Ctrl/Shift+Click open links in a new tab (Discovery.js blocks it)
// https://github.com/discoveryjs/discovery/issues/113
window.addEventListener(
  "click",
  (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      event.stopPropagation();
    }
  },
  true,
);
