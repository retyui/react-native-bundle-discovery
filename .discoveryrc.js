module.exports = {
  name: "react-native-bundle-discovery",
  data: () => require("./tmp/_tvos_9Jul_metro-stats.json"),
  setup: "./setup.js",
  view: {
    assets: [
      // Global styles
      "views/global.css",
      // Pages
      "pages/default.js",
      "pages/module.js",
      "pages/package.js",
      // Custom views
      "views/highcharts.css",
      "views/highcharts.js",
      "views/foamtree.js",
    ],
  },
};
