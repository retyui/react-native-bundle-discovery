const { getReactNativeVersion, isVersionGte } = require("../utils.js");

module.exports = {
  id: "rn-issue-abort-controller-polyfill",
  title: "Remove abort-controller polyfill on React Native 0.87+",
  check: (report) => {
    const packages = report.packages;
    const abortControllerNames = [
      "abort-controller",
      "abort-controller-x",
      "abort-controller-es5",
      "abortcontroller-polyfill",
      "@chainsafe/abort-controller",
    ];
    const abortControllerPkgs = packages.filter((pkg) =>
      abortControllerNames.includes(pkg?.name),
    );

    if (abortControllerPkgs.length === 0) {
      return null;
    }

    const reactNativeVersion = getReactNativeVersion(packages);

    if (!isVersionGte(reactNativeVersion, "0.87.0")) {
      return null;
    }

    return {
      message: `React Native 0.87.x+ includes built-in AbortController / AbortSignal support, so you can remove the \`${abortControllerPkgs.map((pkg) => pkg.name).join(", ")}\` polyfill(s) from the bundle.`,
      packages: [
        ...abortControllerPkgs.map((pkg) => `${pkg.name}@${pkg.version}`),
        `react-native@${reactNativeVersion}`,
      ],
      docsUrl:
        "https://github.com/react/react-native/commit/6f3375a140b10cffe9bed3dd72a017ece97bbbba",
    };
  },
};
