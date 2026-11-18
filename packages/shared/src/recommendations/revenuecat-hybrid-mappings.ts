import { getPackagesSavings } from "./savings";
import type { Recommendation } from "./types";

const MAPPINGS_PKG = "@revenuecat/purchases-js-hybrid-mappings";

const recommendation: Recommendation = {
  id: "revenuecat-hybrid-mappings",
  title: "Exclude RevenueCat web SDK from native bundles",
  check: (report) => {
    if (report.transformOptions?.platform === "web") {
      return null;
    }

    const purchasesPkg = report.packages.find(
      (pkg) => pkg?.name === "react-native-purchases",
    );
    const mappingsPkgs = report.packages.filter(
      (pkg) => pkg?.name === MAPPINGS_PKG,
    );

    if (!purchasesPkg || mappingsPkgs.length === 0) {
      return null;
    }

    return {
      message: `\`react-native-purchases\` always bundles \`${MAPPINGS_PKG}\` (the RevenueCat web SDK), but uses it only in Browser Mode: on web, in Expo Go and in the Rork sandbox.
Native iOS/Android builds use the native module instead, so it can be replaced with an empty module in production bundles:

\`\`\`js
// metro.config.js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    !context.dev && // Expo Go uses it in development
    platform !== 'web' &&
    moduleName === '${MAPPINGS_PKG}'
  ) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};
\`\`\``,
      packages: [
        `${purchasesPkg.name}@${purchasesPkg.version}`,
        ...mappingsPkgs.map((pkg) => `${pkg.name}@${pkg.version}`),
      ],
      docsUrl:
        "https://metrobundler.dev/docs/resolution#resolverequest-customresolver",
      ...getPackagesSavings(report, mappingsPkgs),
    };
  },
};

export default recommendation;
