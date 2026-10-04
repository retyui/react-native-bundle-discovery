import { getPackageModules } from "../prepareReport";
import type { ReportModule } from "../types";
import { getReactNativeVersion, isVersionGte } from "../versions";
import { getModulesSavings } from "./savings";
import type { PreparedReport, Recommendation } from "./types";

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

function findMatchingPromisePolyfills(
  report: PreparedReport,
  entries: string[],
): { names: string[]; modules: ReportModule[] } {
  const packages = report.packages;
  const modules = report.modules;
  const matches = new Set<string>();
  const matchedModules: ReportModule[] = [];
  const entriesCoreJs = entries.filter((entry) => entry.startsWith("core-js/"));
  const entriesNonCoreJs = entries.filter(
    (entry) => !entry.startsWith("core-js/"),
  );

  packages.forEach((pkg) => {
    if (entriesNonCoreJs.includes(pkg?.name)) {
      matches.add(pkg.name);
      matchedModules.push(...getPackageModules(report, pkg));
    }
  });

  modules.forEach((module) => {
    if (entriesCoreJs.some((entry) => module?.path?.includes(entry))) {
      matches.add(module.path);
      matchedModules.push(module);
    }
  });

  return { names: Array.from(matches), modules: matchedModules };
}

const recommendation: Recommendation = {
  id: "rn-issue-promise-polyfill",
  title: "Remove Promise polyfills",
  check: (report) => {
    if (report.kind === "webpack") {
      return null;
    }
    const packages = report.packages;
    const modules = report.modules;
    const reactNativeVersion = getReactNativeVersion(packages);

    const deadPromiseModules = modules.filter((module) =>
      module?.path?.includes(deadCode),
    );
    const hasDeadPromiseModule = deadPromiseModules.length > 0;

    const removablePolyfills: string[] = [];
    const removableModules: ReportModule[] = [...deadPromiseModules];
    const entriesToCheck = [
      isVersionGte(reactNativeVersion, "0.86.0") &&
        promiseTryWithResolversEntries,
      isVersionGte(reactNativeVersion, "0.75.0") && promiseAnyAllSettledEntries,
    ];
    for (const entries of entriesToCheck) {
      if (entries) {
        const found = findMatchingPromisePolyfills(report, entries);
        removablePolyfills.push(...found.names);
        removableModules.push(...found.modules);
      }
    }

    const uniquePolyfills = Array.from(new Set(removablePolyfills));

    if (!hasDeadPromiseModule && uniquePolyfills.length === 0) {
      return null;
    }

    const messageParts: string[] = [];

    if (hasDeadPromiseModule) {
      messageParts.push(
        `Bundle contains \`react-native/Libraries/Promise.js\`. 
This file is dead code because Hermes already provides Promise out of the box. 
You can update 'metro.config.js' to remove this file from the bundle:

\`\`\`js
const { createResolveRequest } = require('react-native-bundle-discovery');
const resolveRequest = createResolveRequest({ removePromisePolyfill: true });

const config = {
  resolver: { resolveRequest },
};
\`\`\``,
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
      ...getModulesSavings(removableModules),
    };
  },
};

export default recommendation;
