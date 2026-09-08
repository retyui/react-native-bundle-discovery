const { getReactNativeVersion, isVersionGte } = require("../utils.js");

const filesToCheck = [
  "react-native/Libraries/Blob/File.js",
  "react-native/Libraries/Utilities/PixelRatio.js",
];

module.exports = {
  id: "rn-issue-hermes-transform-profile",
  title: "Prefer hermes-stable transform profile for React Native 0.84+",
  check: (report) => {
    const reactNativeVersion = getReactNativeVersion(report?.packages);

    // 0.85.x is used as in 0.84.x needs more complicated babel config to avoid ES5 output, so we only recommend for 0.85.x+
    if (!isVersionGte(reactNativeVersion, "0.85.0")) {
      return null;
    }

    const hasClassInOutput = report.modules.some(
      (module) =>
        filesToCheck.some((file) => module?.path?.endsWith(file)) &&
        module?.output?.code?.includes("class "),
    );

    if (hasClassInOutput) {
      return null;
    }

    return {
      message: `Hermes V1 is enabled, but Babel is targeting ES5 because it uses the default transform profile.

To fix the issue, you can set the \`unstable_transformProfile\` option to \`hermes-stable\` in your Babel config:

\`\`\`js
// babel.config.js
module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      { unstable_transformProfile: 'hermes-stable' },
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
