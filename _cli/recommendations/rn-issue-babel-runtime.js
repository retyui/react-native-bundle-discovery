const babelRuntimeInlineCode = [
  // uncompressed
  "function _interopRequireWildcard(",
  "function _callSuper(",
  "function _isNativeReflectConstruct(",
  // compressed
  "Boolean.prototype.valueOf.call(Reflect.construct(Boolean", // _superCall
  "Object.defineProperty)&&Object.getOwnPropertyDescriptor(", // _interopRequireWildcard
];

function hasBabelRuntimeInlineCode(code) {
  return babelRuntimeInlineCode.some((chunk) => code.includes(chunk));
}

function hasInlinedBabelRuntimeHelpers(module) {
  const outputCode = module?.output?.code;
  const sourceCode = module?.source?.code;

  if (typeof outputCode !== "string" || typeof sourceCode !== "string") {
    return false;
  }

  return (
    hasBabelRuntimeInlineCode(outputCode) &&
    !hasBabelRuntimeInlineCode(sourceCode)
  );
}

module.exports = {
  id: "rn-issue-babel-runtime-inline-helpers",
  title: "Enable Babel runtime helpers deduplication",
  check: (report) => {
    const modules = report.modules;
    const inlinedHelpersModules = modules.filter(hasInlinedBabelRuntimeHelpers);

    if (inlinedHelpersModules.length === 0) {
      return null;
    }

    const babelRuntimeVersion = report?.packages?.find(
      (pkg) => pkg?.name === "@babel/runtime",
    )?.version;
    const runtimeVersionForConfig = babelRuntimeVersion ?? "x.x.x";

    return {
      message: `Bundle contains inlined Babel runtime helpers in ${inlinedHelpersModules.length} module(s).

To fix the issue, add the \`enableBabelRuntime\` option to your Babel config, 
where value is \`@babel/runtime\` version installed in your project:

\`\`\`js
// babel.config.js
module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset', 
      { enableBabelRuntime: '${runtimeVersionForConfig}' }
    ],
  ],
};
\`\`\``,
      packages: babelRuntimeVersion
        ? [`@babel/runtime@${babelRuntimeVersion}`]
        : [],
      docsUrl: "https://github.com/react/react-native/issues/57123",
    };
  },
};
