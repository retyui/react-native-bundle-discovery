import type { Recommendation } from "./types";

// i18n libraries whose exports are usually referenced many times per module
// (e.g. `fbt._()`, `i18n.t()`), so inlining their require at every call site
// costs more than a single hoisted variable
const I18N_LIBRARIES = [
  "fbtee",
  "fbt",
  "i18next",
  "react-i18next",
  "react-intl",
  "@formatjs/intl",
  "@lingui/core",
  "@lingui/react",
  "i18n-js",
  "use-intl",
  "typesafe-i18n",
  "@tolgee/react",
];
const DOCS_URL =
  "https://metrobundler.dev/docs/configuration/#gettransformoptions";

const recommendation: Recommendation = {
  id: "i18n-non-inlined-requires",
  title: "Add i18n library to `nonInlinedRequires` in Metro config",
  check: (report) => {
    const i18nPkgs = report.packages.filter((pkg) =>
      I18N_LIBRARIES.includes(pkg?.name),
    );

    if (i18nPkgs.length === 0) {
      return null;
    }

    const names = [...new Set(i18nPkgs.map((pkg) => pkg.name))];

    return {
      message: `${names.map((name) => `\`${name}\``).join(", ")} is expected to be required in many places of your code.
With \`inlineRequires\` enabled, Metro replaces every usage with a separate \`require()\` call.

Add it to \`nonInlinedRequires\` so it's required once per module:

\`\`\`js
// metro.config.js
getTransformOptions: () => ({
  transform: {
    inlineRequires: true,
    nonInlinedRequires: [
      // Copy from: https://github.com/react/metro/blob/4fc75654ea66c973688a76a9ffc512ecf9b9e7ff/packages/metro/src/lib/transformHelpers.js#L36-L43
      'React',
      'react',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'react-compiler-runtime',
      'react-native',
      // New modules here
${names.map((name) => `      '${name}',`).join("\n")}
    ],
  },
}),
\`\`\``,
      packages: i18nPkgs.map((pkg) => `${pkg.name}@${pkg.version}`),
      docsUrl: DOCS_URL,
    };
  },
};

export default recommendation;
