import type { PreparedPackage } from "../prepareReport";
import type { ReportModule } from "../types";
import type { PreparedReport, Recommendation } from "./types";

// e.g. `var __awaiter = (this && this.__awaiter) || function (...)` or
// minified `var n=this&&this.__extends||(...)`
const TS_HELPER_REGEX = /\(?\bthis\s*&&\s*this\.(__[a-zA-Z]+)\)?\s*\|\|/g;
// e.g. `function _classCallCheck(a, n) { ... }`
const BABEL_HELPER_REGEX =
  /\bfunction (_classCallCheck|_createClass|_defineProperties|_defineProperty|_inherits|_possibleConstructorReturn|_assertThisInitialized|_getPrototypeOf|_setPrototypeOf|_callSuper|_isNativeReflectConstruct|_wrapNativeSuper|_interopRequireDefault|_interopRequireWildcard|_asyncToGenerator|asyncGeneratorStep|_regeneratorRuntime|_objectSpread2?|_objectWithoutProperties(?:Loose)?|_extends|_slicedToArray|_toConsumableArray|_arrayLikeToArray|_unsupportedIterableToArray|_iterableToArray(?:Limit)?|_arrayWithHoles|_arrayWithoutHoles|_nonIterableRest|_nonIterableSpread|_createForOfIteratorHelper(?:Loose)?|_toPropertyKey|_toPrimitive|_typeof|_taggedTemplateLiteral)\(/g;

// Packages that provide the helpers, so they are expected to contain them
const HELPER_PACKAGES = [
  "@babel/runtime",
  "@swc/helpers",
  "regenerator-runtime",
  "tslib",
];

// Length of the helper definition starting at `start`: a function body for
// Babel helpers, the `||` expression up to `;` or `,` for TypeScript helpers
function getHelperLength(code: string, start: number, isFunction: boolean) {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    const char = code[i];
    if (char === "(" || char === "[" || char === "{") {
      depth++;
    } else if (char === ")" || char === "]" || char === "}") {
      depth--;
      if (depth < 0 || (isFunction && char === "}" && depth === 0)) {
        return i + 1 - start;
      }
    } else if (!isFunction && depth === 0 && (char === ";" || char === ",")) {
      return i - start;
    }
  }
  return code.length - start;
}

/** Inlined helper name -> its estimated size in the output code */
function getInlinedHelpers(module: ReportModule): Map<string, number> {
  const helpers = new Map<string, number>();
  const code = module?.source?.code;
  if (typeof code !== "string" || code.length === 0) {
    return helpers;
  }

  // Source code is usually not minified, scale it down to the output size
  const outputRatio = Math.min(
    1,
    (module.output?.sizeInBytes ?? code.length) / code.length,
  );
  const matches = [
    ...[...code.matchAll(TS_HELPER_REGEX)].map((m) => ({ m, fn: false })),
    ...[...code.matchAll(BABEL_HELPER_REGEX)].map((m) => ({ m, fn: true })),
  ];
  for (const { m, fn } of matches) {
    if (!helpers.has(m[1])) {
      const length = getHelperLength(code, m.index, fn);
      helpers.set(m[1], Math.round(length * outputRatio));
    }
  }

  return helpers;
}

// The deepest package that contains the module
function findModulePackage(
  report: PreparedReport,
  module: ReportModule,
): PreparedPackage | undefined {
  let found: PreparedPackage | undefined;
  for (const pkg of report.packages) {
    if (
      module.path.startsWith(`${pkg.absolutePath}/`) &&
      pkg.absolutePath.length > (found?.absolutePath.length ?? -1)
    ) {
      found = pkg;
    }
  }
  return found;
}

interface PackageHelpers {
  pkg: PreparedPackage;
  helpers: Set<string>;
  files: string[];
  sizeInBytes: number;
}

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const recommendation: Recommendation = {
  id: "inlined-package-helpers",
  title: "Packages with inlined TypeScript/Babel helpers",
  check: (report) => {
    const byPackage = new Map<string, PackageHelpers>();
    // The smallest copy of each helper, it is kept in `tslib`/`@babel/runtime`
    const keptCopies = new Map<string, number>();

    for (const module of report.modules) {
      if (!module?.path?.includes("/node_modules/")) {
        continue;
      }

      const helpers = getInlinedHelpers(module);
      if (helpers.size === 0) {
        continue;
      }

      const pkg = findModulePackage(report, module);
      if (!pkg || HELPER_PACKAGES.includes(pkg.name)) {
        continue;
      }

      const entry = byPackage.get(pkg.absolutePath) ?? {
        pkg,
        helpers: new Set(),
        files: [],
        sizeInBytes: 0,
      };
      for (const [helper, size] of helpers) {
        entry.helpers.add(helper);
        entry.sizeInBytes += size;
        keptCopies.set(helper, Math.min(keptCopies.get(helper) ?? size, size));
      }
      entry.files.push(module.path);
      byPackage.set(pkg.absolutePath, entry);
    }

    if (byPackage.size === 0) {
      return null;
    }

    const entries = [...byPackage.values()].sort(
      (a, b) => b.files.length - a.files.length,
    );

    const list = entries
      .map(({ pkg, helpers, files, sizeInBytes }) => {
        const prefix = `${pkg.absolutePath}/`;
        return `- \`${pkg.name}@${pkg.version}\` (${files.length} file(s), ~${formatKB(sizeInBytes)}): ${[
          ...helpers,
        ]
          .map((helper) => `\`${helper}\``)
          .join(", ")}
${files.map((file) => `  - \`${file.replace(prefix, "")}\``).join("\n")}`;
      })
      .join("\n");

    const helpersSize = entries.reduce(
      (sum, entry) => sum + entry.sizeInBytes,
      0,
    );
    const keptSize = [...keptCopies.values()].reduce((a, b) => a + b, 0);
    const sizeInBytes = Math.max(0, helpersSize - keptSize);

    return {
      message: `${entries.length} package(s) ship TypeScript/Babel helpers inlined into their source code, so the same helpers are repeated in every file (~${formatKB(helpersSize)} in total, ~${formatKB(sizeInBytes)} can be removed by importing them from a shared package):

${list}

Ask the package maintainers to import helpers from \`tslib\` (\`"importHelpers": true\` in tsconfig.json) or \`@babel/runtime\` (\`@babel/plugin-transform-runtime\`), or use an alternative package.`,
      packages: entries.map(({ pkg }) => `${pkg.name}@${pkg.version}`),
      docsUrl: [
        "https://www.typescriptlang.org/tsconfig/#importHelpers",
        "https://babeljs.io/docs/babel-plugin-transform-runtime",
      ],
      // Estimated: all inlined copies minus one copy of each helper
      sizeInBytes,
      modules: entries.flatMap(({ files }) => files),
    };
  },
};

export default recommendation;
