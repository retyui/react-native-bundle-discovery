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
  const packages = report.packages;
  const modules = report.modules;
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
  title: "Remove Promise polyfills",
  check: (report) => {
    const packages = report.packages;
    const modules = report.modules;
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
        `Bundle contains \`react-native/Libraries/Promise.js\`. 
This file is dead code because Hermes already provides Promise out of the box. 
You can update 'metro.config.js' to remove this file from the bundle:

\`\`\`js
const { createProcessModuleFilter } = require('react-native-bundle-discovery');
const processModuleFilter = createProcessModuleFilter({ removePromisePolyfill: true });

const config = {
  serializer: { processModuleFilter },
};
\`\`\`

        `,
      );
    }

    if (uniquePolyfills.length > 0) {
      messageParts.push(
        `Bundle also includes Promise polyfill modules/packages that Hermes already supports natively.
Consider removing: ${uniquePolyfills.join(", ")}.`,
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
