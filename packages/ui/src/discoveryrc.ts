import path from "node:path";

// Paths are relative to `dist/`, where this file is emitted
const config = {
  name: "react-native-bundle-discovery",
  // Used by `yarn dev` only: loads `<repo root>/tmp/metro-stats.json`
  data: () => require(path.resolve(__dirname, "../../../tmp/metro-stats.json")),
  setup: path.resolve(__dirname, "client/setup.js"),
  view: {
    assets: [
      // Global styles
      path.resolve(__dirname, "../assets/global.css"),
      // Pages
      path.resolve(__dirname, "client/pages/default.js"),
      path.resolve(__dirname, "client/pages/module.js"),
      path.resolve(__dirname, "client/pages/package.js"),
      // Custom views
      path.resolve(__dirname, "../assets/highcharts.css"),
      path.resolve(__dirname, "client/views/prettify.js"),
      path.resolve(__dirname, "client/views/highcharts.js"),
      path.resolve(__dirname, "client/views/moduleOverview.js"),
      path.resolve(__dirname, "client/views/treemap.js"),
      path.resolve(__dirname, "client/views/persistedFilterInput.js"),
    ],
  },
};

export default config;
