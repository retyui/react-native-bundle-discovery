const { isVersionGte } = require("../utils.js");

module.exports = {
  id: "radial-gradient-vs-background-image",
  title: "Replace third-party radial gradient libraries with built-in backgroundImage",
  check(report) {
    const packages = report?.packages ?? [];
    const gradientPkgs = packages.filter(
      (pkg) => pkg?.name === "react-native-radial-gradient" || pkg?.name === "expo-radial-gradient",
    );

    if (gradientPkgs.length === 0) {
      return null;
    }

    const reactNativeVersion = packages.find((pkg) => pkg?.name === "react-native")?.version;

    if (!isVersionGte(reactNativeVersion, "0.80.0")) {
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
      message: `React Native ships built-in \`radial-gradient()\` support (starting React Native 0.80.x+). You can remove ${gradientPkgs.map(e => e.name).join(", ")} and migrate to a simple View with a \`${backgroundImageProp}\` style prop.`,
      packages: [...gradientPkgs.map(e => `${e.name}@${e.version}`), `react-native@${reactNativeVersion}`],
      docsUrl: `https://reactnative.dev/docs/${reactNativeVersion}/view-style-props#${docsAnchor}`,
    };
  },
};
