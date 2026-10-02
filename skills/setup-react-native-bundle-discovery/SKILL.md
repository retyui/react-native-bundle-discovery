---
name: setup-react-native-bundle-discovery
description: >
  Install ONLY the `react-native-bundle-discovery` package and wire it into a React Native
  project so a bundle report is generated when the `BUNDLE_ANALYZER` env var
  is set. Works for both plain Metro projects (via `createSerializer` in
  `metro.config.js`) and Re.Pack projects (via `BundleDiscoveryPlugin` in
  `rspack.config.mjs` / `webpack.config.js`). Use this skill whenever the user
  asks to "add bundle analysis", "install react-native-bundle-discovery",
  "set up BUNDLE_ANALYZER", or similar.
---

# Setup `react-native-bundle-discovery`

## Goal

Install **only** the `react-native-bundle-discovery` then wire it into the project's
bundler config so a JSON report is produced **only** when the
`BUNDLE_ANALYZER` environment variable is set.

## Step 1 — Detect the project type

Inspect the repo root (and any workspace packages) for:

- **Re.Pack project**: a `rspack.config.mjs`, `rspack.config.js`, or
  `webpack.config.js` that imports `@callstack/repack` and calls
  `Repack.defineRspackConfig(...)` / `Repack.defineWebpackConfig(...)`.
- **Plain Metro project**: a `metro.config.js` and no Re.Pack bundler config.

If both exist, prefer the Re.Pack path (that's what actually builds the JS
bundle). If unsure, ask the user which bundler they use.

## Step 2 — Install the dependency

```bash
# yarn
yarn add -D react-native-bundle-discovery

# or npm
npm install --save-dev react-native-bundle-discovery

# or pnpm
pnpm add -D react-native-bundle-discovery
```

Do **not** install `react-native-bundle-discovery-ui` or
`react-native-bundle-discovery-cli` as part of this task.

## Step 3a — Plain Metro project: edit `metro.config.js`

Merge in a `serializer.customSerializer`, gated behind `BUNDLE_ANALYZER`,
without removing any existing config:

```js
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { createSerializer } = require('react-native-bundle-discovery');

const config = {
  // ...keep existing config here...
};

if (process.env.BUNDLE_ANALYZER) {
  config.serializer = {
    ...config.serializer,
    customSerializer: createSerializer({
      projectRoot: __dirname,
      // ⚠️ In a monorepo, point `projectRoot` at the monorepo root instead.
    }),
  };
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### If the project already has a custom serializer

If `metro.config.js` already defines its own
`config.serializer.customSerializer` (e.g. for Reanimated or any other tool;
for Sentry see the next section), **do not replace it**. Instead, pass the existing serializer
function through to `createSerializer` via its `serializer` option, so
`react-native-bundle-discovery` wraps it instead of overriding it:

```js
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { createSerializer } = require('react-native-bundle-discovery');

const config = {
  // ...keep existing config here...
  serializer: {
    // ...keep existing serializer options here...
    customSerializer: existingCustomSerializer, // the dev's own serializer fn
  },
};

if (process.env.BUNDLE_ANALYZER) {
  config.serializer = {
    ...config.serializer,
    customSerializer: createSerializer({
      projectRoot: __dirname,
      // Pass the existing custom serializer so it still runs — bundle
      // discovery just wraps it to also produce the JSON report.
      serializer: config.serializer.customSerializer,
    }),
  };
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

If `config.serializer.customSerializer` is undefined (no pre-existing custom
serializer), the `serializer` option can simply be omitted — `createSerializer`
falls back to Metro's default serializer automatically.

### If `@sentry/react-native` is installed

Check `package.json` (`dependencies` / `devDependencies`) for
`@sentry/react-native`. If it is present, pass Sentry's default Metro
serializer to `createSerializer` via the `serializer` option instead of
relying on Metro's default:

```js
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { createSerializer } = require('react-native-bundle-discovery');

const config = {
  // ...keep existing config here...
};

if (process.env.BUNDLE_ANALYZER) {
  const {
    createDefaultMetroSerializer,
  } = require('@sentry/react-native/dist/js/tools/vendor/metro/utils');

  config.serializer = {
    ...config.serializer,
    customSerializer: createSerializer({
      projectRoot: __dirname,
      serializer: createDefaultMetroSerializer(),
    }),
  };
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

Keep any existing Sentry wrapper (e.g. `withSentryConfig(...)` /
`getSentryExpoConfig(...)`) exactly as it is.

## Step 3b — Re.Pack project: edit `rspack.config.mjs` (or `webpack.config.js`)

Import `BundleDiscoveryPlugin` and append it to the `plugins` array, gated
behind `BUNDLE_ANALYZER`, without removing any existing plugins:

```tsx
// rspack.config.mjs (or webpack.config.js)
import { BundleDiscoveryPlugin } from 'react-native-bundle-discovery';

export default Repack.defineRspackConfig({
  plugins: [
    // ...keep existing plugins here...
    new BundleDiscoveryPlugin({
        filename: 'metro-stats.json',
        options: { source: true },
        enabled: !!process.env.BUNDLE_ANALYZER,
    }),
  ],
});
```

## Step 4 — Explain how to build with the flag enabled

```bash
BUNDLE_ANALYZER=1 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets --reset-cache
```

After the build, a `metro-stats.json` file will be generated in the project
root. Mention that it can be visualized with
`npx react-native-bundle-discovery-ui metro-stats.json` or analyzed with
`npx react-native-bundle-discovery-cli metro-stats.json` — but only install
those extra packages if the user asks for them.

## Constraints / guardrails

- Only add the `react-native-bundle-discovery` dependency
- Always gate the integration behind `process.env.BUNDLE_ANALYZER` so normal
  builds are unaffected.
- Never overwrite unrelated parts of `metro.config.js` / `rspack.config.mjs` /
  `webpack.config.js` — merge in the minimal diff.
- If the project is a monorepo, set `projectRoot` (Metro) to the monorepo
  root, not the individual package directory.
- If the project already has its own `config.serializer.customSerializer` in
  `metro.config.js`, do not discard it — pass it to `createSerializer` as the
  `serializer` option so it keeps running.
- If `@sentry/react-native` is installed, pass Sentry's
  `createDefaultMetroSerializer()` (from
  `@sentry/react-native/dist/js/tools/vendor/metro/utils`) as the
  `serializer` option.

## References in this repo

- `README.md` — full independent-tool setup docs.
- `Re.Pack.md` — Re.Pack-specific `BundleDiscoveryPlugin` docs.
- `_serializer/index.js` — `createSerializer` implementation.
- `_serializer/webpack.js` — `BundleDiscoveryPlugin` implementation.
