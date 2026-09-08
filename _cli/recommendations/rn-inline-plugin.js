const { getReactNativeVersion, isVersionGte } = require("../utils.js");

const TARGET_MODULE_PATH =
  "react-native/Libraries/Components/Pressable/useAndroidRippleForView.js";
const ANDROID_PLATFORM_CHECK_PATTERN = /['"]android['"]===\w\.default\.OS/g;
const DOCS_URL = "https://github.com/react/react-native/pull/57848";

function findAffectedModules(report) {
  const modules = report?.modules ?? [];
  return modules.find((module) => {
    return (
      module?.path?.includes(TARGET_MODULE_PATH) &&
      ANDROID_PLATFORM_CHECK_PATTERN.test(module?.output?.code ?? "")
    );
  });
}

module.exports = {
  id: "rn-inline-platform-plugin",
  title: "Remove platform-specific dead code from production bundle",
  check: (report) => {
    const packages = report?.packages ?? [];
    const reactNativeVersion = getReactNativeVersion(packages);

    // Issue is fixed in React Native 0.88.0, so we can skip the recommendation for versions >= 0.88.0
    if (isVersionGte(reactNativeVersion, "0.88.0")) {
      return null;
    }

    if (!findAffectedModules(report)) {
      return null;
    }

    return {
      message: `Detected dead code for ${report?.transformOptions?.platform === "android" ? "iOS" : "Android"} platform. 

You can save bundle size by removing the that code as ${report?.transformOptions?.platform === "android" ? "iOS" : "Android"} code won't be executed on ${report?.transformOptions?.platform === "android" ? "Android" : "iOS"} platform.

🍏 iOS: -17.76 KB
🤖 Android: -19.61 KB

To fix the issue you can bump \`@react-native/babel-preset\` to \`0.88.x\` or \`nightly\` (if \`0.88.x\` not released yet).`,
      packages: ["@react-native/babel-preset"],
      docsUrl: DOCS_URL,
    };
  },
};
