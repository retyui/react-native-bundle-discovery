# Re.Pack

For projects using [Re.Pack](https://re-pack.dev/docs/guides/bundle-analysis) there are two ways to use `react-native-bundle-discovery`:

1. As the [`BundleDiscoveryPlugin`](https://github.com/retyui/react-native-bundle-discovery/blob/main/packages/serializer/src/webpack.ts) Webpack/Rspack plugin
2. Or with a JSON report from [Rsdoctor](https://rsdoctor.rs/)

:::tip
Using an AI coding agent? Point it at the [`setup-react-native-bundle-discovery`](/docs/guides/ai-agent) skill to install `react-native-bundle-discovery` automatically.
:::

## Rspack/Webpack plugin

`BundleDiscoveryPlugin` creates a `metro-stats.json` file that `react-native-bundle-discovery` uses to analyze your JS bundle.

1. Install the package:

```bash
yarn add -D react-native-bundle-discovery
```

2. Register the `BundleDiscoveryPlugin` plugin:

```ts title="rspack.config.mjs (or webpack.config.js)"
import { BundleDiscoveryPlugin } from 'react-native-bundle-discovery';

export default Repack.defineRspackConfig({
  plugins: [
    new BundleDiscoveryPlugin({
      // Default options, you can customize them if needed
      filename: 'metro-stats.json',
      options: { source: true }, // All options: https://webpack.js.org/configuration/stats/#stats-options
      enabled: !!process.env.BUNDLE_ANALYZER,
    }),
  ],
});
```

3. Build the app with the `BUNDLE_ANALYZER` environment variable:

```bash
BUNDLE_ANALYZER=1 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets --reset-cache
```

4. After the build, `metro-stats.json` is in the root of your project. Analyze it:

```bash
npx react-native-bundle-discovery-ui metro-stats.json   # UI
npx react-native-bundle-discovery-cli metro-stats.json  # CLI
```

## JSON report from Rsdoctor

If you use [Rsdoctor](https://rsdoctor.rs/), generate a JSON report that `react-native-bundle-discovery` can read.

1. Install the packages:

```bash
yarn add -D react-native-bundle-discovery-ui
yarn add -D @rsdoctor/rspack-plugin
# or the webpack version if used instead of rspack:
yarn add -D @rsdoctor/webpack-plugin
```

2. Register the [`RsdoctorRspackPlugin`](https://rsdoctor.rs/guide/start/quick-start#step-2-register-plugin) plugin:

```ts title="rspack.config.mjs (or webpack.config.js)"
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
// or import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';

export default Repack.defineRspackConfig({
  plugins: [
    process.env.RSDOCTOR &&
      new RsdoctorRspackPlugin({
        // or `RsdoctorWebpackPlugin`
        disableClientServer: true,
        output: {
          reportDir: '.',
          mode: 'brief',
          options: { type: ['json'] },
        },
      }),
  ].filter(Boolean),
});
```

3. Build the app with the `RSDOCTOR` environment variable:

```bash
RSDOCTOR=1 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets --reset-cache
```

4. After the build, `rsdoctor-data.json` is in the root of your project. Analyze it:

```bash
npx react-native-bundle-discovery-ui rsdoctor-data.json   # UI
npx react-native-bundle-discovery-cli rsdoctor-data.json  # CLI
```

:::warning Known limitations
`rsdoctor-data.json` does not include the source code or bundled output code.
:::

## Alternative tools

- [Re.Pack bundle analysis guide](https://re-pack.dev/docs/guides/bundle-analysis)
