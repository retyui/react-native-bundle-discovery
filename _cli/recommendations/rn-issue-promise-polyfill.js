const { getReactNativeVersion, isVersionGte } = require("../utils.js");

const deadCode = "react-native/Libraries/Promise.js";

const promiseTryWithResolversEntries = [
  // 0.86.0
  "promise.try",
  "promise-try",
  "core-js/es/promise/try",

  "promise.withresolvers",
  "core-js/es/promise/with-resolvers",
];

const promiseAnyAllSettledEntries = [
  // 0.75.0
  "promise.any",
  "promise-any-polyfill",
  "core-js/es/promise/any",

  "promise.allsettled",
  "core-js/es/promise/all-settled",
];

function findMatchingPromisePolyfills(report, entries) {
  const packages = report?.packages ?? [];
  const modules = report?.modules ?? [];
  const matches = new Set();
  const entriesCoreJs = entries.filter((entry) => entry.startsWith("core-js/"));
  const entriesNonCoreJs = entries.filter(
    (entry) => !entry.startsWith("core-js/"),
  );

  packages.forEach((pkg) => {
    if (entriesNonCoreJs.includes(pkg?.name)) {
      matches.add(pkg.name);
    }
  });

  modules.forEach((module) => {
    if (entriesCoreJs.some((entry) => module?.path?.includes(entry))) {
      matches.add(module.path);
    }
  });

  return Array.from(matches);
}

module.exports = {
  id: "rn-issue-promise-polyfill",
  title: "Remove Promise polyfills and dead code on modern React Native",
  check: (report) => {
    const packages = report?.packages ?? [];
    const modules = report?.modules ?? [];
    const reactNativeVersion = getReactNativeVersion(packages);

    const hasDeadPromiseModule = modules.some((module) =>
      module?.path?.includes(deadCode),
    );

    const removablePolyfills = [];
    if (isVersionGte(reactNativeVersion, "0.86.0")) {
      removablePolyfills.push(
        ...findMatchingPromisePolyfills(report, promiseTryWithResolversEntries),
      );
    }

    if (isVersionGte(reactNativeVersion, "0.75.0")) {
      removablePolyfills.push(
        ...findMatchingPromisePolyfills(report, promiseAnyAllSettledEntries),
      );
    }

    const uniquePolyfills = Array.from(new Set(removablePolyfills));

    if (!hasDeadPromiseModule && uniquePolyfills.length === 0) {
      return null;
    }

    const messageParts = [];

    if (hasDeadPromiseModule) {
      messageParts.push(
        "Bundle contains `react-native/Libraries/Promise.js`, which is dead code on Hermes. " +
          "Patch React Native to stop loading it: in `node_modules/react-native/Libraries/Core/polyfillPromise.js`, " +
          "comment out `polyfillGlobal('Promise', () => require('../Promise').default);`, then generate a patch with `patch-package react-native`. " +
          "Or exclude it at bundle time in `metro.config.js` via `serializer.processModuleFilter`, e.g. return false for modules ending with `react-native/Libraries/Promise.js`.",
      );
    }

    if (uniquePolyfills.length > 0) {
      messageParts.push(
        "Bundle also includes Promise polyfill modules/packages that Hermes supports out of the box. " +
          `Consider removing: ${uniquePolyfills.join(", ")}.`,
      );
    }

    return {
      message: messageParts.join("\n\n"),
      packages: reactNativeVersion
        ? [`react-native@${reactNativeVersion}`]
        : [],
      docsUrl: [
        "https://github.com/react/react-native/issues/57702",
        "https://github.com/react/react-native/pull/57215",
      ],
    };
  },
};
