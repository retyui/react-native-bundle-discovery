const {
  getReactNativeVersion,
  isVersionGte,
  formatRnVersionToDocsFormat,
} = require("../utils.js");

module.exports = {
  id: "linear-gradient-vs-background-image",
  title:
    "Replace third-party linear gradient libraries with built-in backgroundImage",
  check(report) {
    const packages = report.packages;
    const gradientPkgs = packages.filter(
      (pkg) =>
        pkg?.name === "react-native-linear-gradient" ||
        pkg?.name === "expo-linear-gradient",
    );

    if (gradientPkgs.length === 0) {
      return null;
    }

    const reactNativeVersion = getReactNativeVersion(packages);

    if (!isVersionGte(reactNativeVersion, "0.76.0")) {
      return null;
    }

    const isStableBackgroundImage = isVersionGte(reactNativeVersion, "0.87.0");
    const backgroundImageProp = isStableBackgroundImage
      ? "backgroundImage"
      : "experimental_backgroundImage";
    const docsAnchor = isStableBackgroundImage
      ? "backgroundimage"
      : "experimental_backgroundimage";

    return {
      message: `React Native ships built-in \`linear-gradient()\` support (starting React Native 0.76.x+).
You can remove ${gradientPkgs.map((e) => e.name).join(", ")} 
and migrate to a simple View with a \`${backgroundImageProp}\` style prop.`,
      packages: [
        ...gradientPkgs.map((e) => `${e.name}@${e.version}`),
        `react-native@${reactNativeVersion}`,
      ],
      docsUrl: `https://reactnative.dev/docs/${formatRnVersionToDocsFormat(reactNativeVersion)}/view-style-props#${docsAnchor}`,
    };
  },
};
