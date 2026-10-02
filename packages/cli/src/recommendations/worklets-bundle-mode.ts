import type { Recommendation } from "../types";
import { getReactNativeVersion, isVersionGte } from "../utils";

const BUNDLE_MODE_MODULES_PATH =
  "node_modules/react-native-worklets/.worklets/";

const recommendation: Recommendation = {
  id: "worklets-bundle-mode",
  title: "Enable Bundle Mode in react-native-worklets",
  check: (report) => {
    const packages = report.packages;
    const workletsPkg = packages.find(
      (pkg) =>
        pkg?.name === "react-native-worklets" &&
        isVersionGte(pkg.version, "0.10.0"),
    );

    if (!workletsPkg) {
      return null;
    }

    const reactNativeVersion = getReactNativeVersion(packages);

    if (!isVersionGte(reactNativeVersion, "0.82.4")) {
      return null;
    }

    const isBundleModeEnabled = report.modules.some((module) =>
      module?.path?.includes(BUNDLE_MODE_MODULES_PATH),
    );

    if (isBundleModeEnabled) {
      return null;
    }

    return {
      message: `\`react-native-worklets\` 0.10.x+ supports Bundle Mode, which gives worklets access to the entire JavaScript bundle.
Third-party libraries can be used in worklets without patching, and worklets benefit from pre-compiled bytecode instead of runtime evaluation.
Consider enabling Bundle Mode (it will become the default way of using worklets in the future).
More details: https://x.com/tell_me_mur/status/2105190960363880647`,
      packages: [
        `${workletsPkg.name}@${workletsPkg.version}`,
        `react-native@${reactNativeVersion}`,
      ],
      docsUrl:
        "https://docs.swmansion.com/react-native-worklets/docs/bundleMode/",
    };
  },
};

export default recommendation;
