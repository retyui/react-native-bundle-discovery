function isDark() {
  const isSystemDarkMode = window?.matchMedia?.(
    "(prefers-color-scheme: dark)",
  )?.matches;
  const userMode = localStorage.getItem("discoveryjs:color-scheme");
  return userMode === "auto" ? isSystemDarkMode : userMode === "dark";
}

function doTheming(el) {
  const dark = isDark();
  el.classList.add("highcharts-light");
  el.classList[!dark ? "add" : "remove"]("my-light");
  el.classList[dark ? "add" : "remove"]("highcharts-dark");
}

// apply theme on import
if (isDark()) {
  // require("highcharts/themes/dark-unica"); // no
  // require("highcharts/themes/brand-dark");
  // require("highcharts/themes/dark-blue");
  // require("highcharts/themes/dark-green");
  require("highcharts/themes/high-contrast-dark");
} else {
  // require("highcharts/themes/avocado");
  // require("highcharts/themes/brand-light");
  // require("highcharts/themes/gray");
  // require("highcharts/themes/grid-light"); // no
  // require("highcharts/themes/grid");
  // require("highcharts/themes/high-contrast-light");
  // require("highcharts/themes/sand-signika"); // no
  // require("highcharts/themes/skies");
  // require("highcharts/themes/sunset");
}

module.exports = { doTheming };
