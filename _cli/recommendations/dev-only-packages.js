const { getReactNativeVersion, isVersionGte } = require("../utils");
const rn74PlusDevOnlyPackages = [
  "prop-types",
  "deprecated-react-native-prop-types",
];
const devOnlyPackages = [
  "redux-logger",
  "redux-devtools",
  "@redux-devtools/core",
  "@redux-devtools/extension",
  "redux-devtools-extension",
  "@redux-devtools/instrument",
  "@redux-devtools/remote-redux-devtools",
  "@storybook/react",
  "@storybook/react-native",
  "@storybook/addon-actions",
  "@storybook/addon-links",
  "json-server",
  "miragejs",
  "@faker-js/faker",
  "msw",
  "eruda",
  "vconsole",
  "react-developer-tools",
  "react-render-tracker",
  "why-did-you-render",
  "@welldone-software/why-did-you-render",
  "use-what-changed",
  "mobx-react-devtools",
  "mobx-devtools",
  "@tanstack/react-query-devtools",
  "react-devtools-core",
  "react-refresh",
];

function findBundledDevPackages(report, _devOnlyPackages) {
  const packages = report.packages;
  const modules = report.modules;
  const matches = new Set();

  for (const pkg of packages) {
    if (
      _devOnlyPackages.includes(pkg?.name) &&
      Number(pkg?.sizeInBytes ?? 0) > 1000
    ) {
      matches.add(`${pkg.name}@${pkg.version}`);
    }
  }

  for (const module of modules) {
    const modulePath = module?.path;
    if (typeof modulePath !== "string") {
      continue;
    }

    for (const pkgName of _devOnlyPackages) {
      if (
        modulePath.includes(`/node_modules/${pkgName}/`) ||
        modulePath.endsWith(`/node_modules/${pkgName}`)
      ) {
        const pkgVersion = packages.find(
          (pkg) => pkg?.name === pkgName,
        )?.version;
        matches.add(pkgVersion ? `${pkgName}@${pkgVersion}` : pkgName);
      }
    }
  }

  return Array.from(matches);
}

module.exports = {
  id: "dev-only-packages-in-production-bundle",
  title: "Remove dev-only packages from production bundle",
  check: (report) => {
    const bundledDevPackages = findBundledDevPackages(
      report,
      isVersionGte(getReactNativeVersion(report.packages), "0.74.0")
        ? [...devOnlyPackages, ...rn74PlusDevOnlyPackages]
        : devOnlyPackages,
    );

    if (bundledDevPackages.length === 0) {
      return null;
    }

    return {
      message:
        `Detected dev-only packages in the production bundle: ${bundledDevPackages.join(", ")}. ` +
        "Move debug-only imports/usage behind `__DEV__` checks so Metro can exclude them from release builds.",
      packages: bundledDevPackages,
      docsUrl: "https://reactnative.dev/docs/global-__DEV__",
    };
  },
};
