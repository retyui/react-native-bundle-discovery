import { getModulesSavings } from "./savings";
import type { Recommendation } from "./types";

const XHR_MODULE_REGEX = /\/XMLHttpRequest\./;
const RN_XHR_MODULE = "react-native/Libraries/Network/XMLHttpRequest.js";

const recommendation: Recommendation = {
  id: "duplicate-xml-http-request",
  title: "Use React Native's built-in XMLHttpRequest",
  check: (report) => {
    const xhrModules = report.modules.filter((module) =>
      XHR_MODULE_REGEX.test(module?.path ?? ""),
    );

    if (xhrModules.length <= 1) {
      return null;
    }

    const extraModules = xhrModules.filter(
      (module) => !module.path.includes(RN_XHR_MODULE),
    );

    return {
      message: `Bundle contains ${xhrModules.length} \`XMLHttpRequest\` implementations.
React Native already provides one (\`node_modules/${RN_XHR_MODULE}\`), so other XMLHttpRequest polyfills/implementations can be removed:

${extraModules.map((module) => `- \`${module.path}\``).join("\n")}`,
      ...getModulesSavings(extraModules),
    };
  },
};

export default recommendation;
