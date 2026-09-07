const { getReactNativeVersion, isVersionGte } = require("../utils.js");

const filesToCheck = [
  "react-native/Libraries/Blob/File.js",
  "react-native/Libraries/Utilities/PixelRatio.js",
];

module.exports = {
  id: "rn-issue-hermes-transform-profile",
  title: "Prefer hermes-stable transform profile for React Native 0.85+",
  check: (report) => {
    const reactNativeVersion = getReactNativeVersion(report?.packages);

    if (!isVersionGte(reactNativeVersion, "0.85.0")) {
      return null;
    }

    const hasClassInOutput = (report?.modules ?? []).some(
      (module) =>
        filesToCheck.some((file) => module?.path?.endsWith(file)) &&
        module?.output?.code?.includes("class "),
    );

    if (hasClassInOutput) {
      return null;
    }

    return {
      message: `Hermes V1 is enabled, but Babel is targeting ES5 because it uses the default transform profile.

Fix in babel.config.js:
\`\`\`js
module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      { unstable_transformProfile: 'hermes-stable' }, // <-- HERE
    ],
  ],
};
\`\`\``,
      packages: [`react-native@${reactNativeVersion}`],
      docsUrl: [
        "https://reactnative.dev/blog/2026/02/11/react-native-0.84",
        "https://github.com/react/react-native/issues/57174",
      ],
    };
  },
};
