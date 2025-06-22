const path = require("path");

module.exports = {
  name: "react-native-bundle-discovery",
  data: () => require("./tmp/before_metro-stats.json"),
  setup: path.resolve(__dirname, "setup.js"),
  view: {
    assets: [
      // Global styles
      path.resolve(__dirname, "views/global.css"),
      // Pages
      path.resolve(__dirname, "pages/default.js"),
      path.resolve(__dirname, "pages/module.js"),
      path.resolve(__dirname, "pages/package.js"),
      // Custom views
      path.resolve(__dirname, "views/highcharts.css"),
      path.resolve(__dirname, "views/prettify.js"),
      path.resolve(__dirname, "views/highcharts.js"),
      path.resolve(__dirname, "views/foamtree.js"),
    ],
  },
};
