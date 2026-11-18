import { isVersionGte } from "../versions";
import { getModulesSavings } from "./savings";
import type { Recommendation } from "./types";

// `@sentry-internal/replay`, `@sentry-internal/replay-canvas`
const REPLAY_MODULE_REGEX = /node_modules\/@sentry(?:-internal)?\/replay/;
// `@sentry-internal/feedback` and its `@sentry/browser` wrappers
const FEEDBACK_MODULE_REGEX =
  /node_modules\/(?:@sentry(?:-internal)?\/feedback|@sentry\/browser\/.*\/feedback(?:Sync|Async))/;

// `includeWebReplay: false` removes `@sentry-internal/replay` since 6.12.0
const MIN_REPLAY_VERSION = "6.12.0";
// `includeWebFeedback` was added in 8.10.0, its startup crash was fixed in 8.12.0
const MIN_FEEDBACK_VERSION = "8.12.0";

const recommendation: Recommendation = {
  id: "sentry-web-replay-feedback",
  title: "Exclude Sentry Web Replay and Feedback from native bundles",
  check: (report) => {
    const sentryPkg = report.packages.find(
      (pkg) => pkg?.name === "@sentry/react-native",
    );

    if (!sentryPkg) {
      return null;
    }

    const replayModules = isVersionGte(sentryPkg.version, MIN_REPLAY_VERSION)
      ? report.modules.filter((module) =>
          REPLAY_MODULE_REGEX.test(module?.path ?? ""),
        )
      : [];
    const feedbackModules = isVersionGte(
      sentryPkg.version,
      MIN_FEEDBACK_VERSION,
    )
      ? report.modules.filter((module) =>
          FEEDBACK_MODULE_REGEX.test(module?.path ?? ""),
        )
      : [];

    const options = [
      replayModules.length > 0 && "includeWebReplay: false",
      feedbackModules.length > 0 && "includeWebFeedback: false",
    ].filter(Boolean);

    if (options.length === 0) {
      return null;
    }

    return {
      message: `\`@sentry/react-native\` bundles the web Session Replay and User Feedback integrations, which are unused in native apps (they have native Replay and Feedback).
Exclude them in metro.config.js:

\`\`\`js
module.exports = withSentryConfig(config, {
${options.map((option) => `  ${option},`).join("\n")}
});
// or for Expo
const config = getSentryExpoConfig(__dirname, {
${options.map((option) => `  ${option},`).join("\n")}
});
\`\`\``,
      packages: `${sentryPkg.name}@${sentryPkg.version}`,
      docsUrl:
        "https://docs.sentry.io/platforms/react-native/manual-setup/metro/",
      ...getModulesSavings([...replayModules, ...feedbackModules]),
    };
  },
};

export default recommendation;
