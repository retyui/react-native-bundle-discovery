<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://re-pack.dev/img/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://re-pack.dev/img/logo-light.png">
  <img alt="Project Logo or Description" src="https://re-pack.dev/img/logo-dark.png">
</picture>
</div>

<br/>

For projects using [Re.Pack](https://re-pack.dev/docs/guides/bundle-analysis) there are two ways to use `react-native-bundle-discovery`:

1. As [`BundleDiscoveryPlugin`](https://github.com/retyui/react-native-bundle-discovery/blob/main/_serializer/webpack.js) Webpack/Rspack plugin
2. or JSON report from [`Rsdoctor`](https://rsdoctor.rs/)

---


## 1. Rspack/Webpack plugin

`BundleDiscoveryPlugin` is a plugin for Webpack/Rspack that creates a `metro-stats.json` file that can be used by `react-native-bundle-discovery` to analyze your JS bundle.

### Setup

1. Install package:

```bash
yarn add -D react-native-bundle-discovery
```

2. Register the `BundleDiscoveryPlugin` plugin:

```tsx
// rspack.config.mjs (or webpack.config.js)
import { BundleDiscoveryPlugin } from 'react-native-bundle-discovery';

export default Repack.defineRspackConfig({
  plugins: [
    process.env.BUNDLE_ANALYZER && new BundleDiscoveryPlugin({
        // Default options, you can customize them if needed
        filename: 'metro-stats.json',
        options: { source: true }, // All options: https://webpack.js.org/configuration/stats/#stats-options
        enabled: true
    })
  ].filter(Boolean),
});
```
3. Build the app with the `BUNDLE_ANALYZER` environment variable:

```bash
# Re.Pack example:
BUNDLE_ANALYZER=1 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets --reset-cache
```

4. After the build, you will find the `metro-stats.json` file in the root of your project.

5. Use that JSON file to analyze your JS bundle with `react-native-bundle-discovery`:

```bash
# Open UI
npx react-native-bundle-discovery-ui metro-stats.json

# Or CLI interface
npx react-native-bundle-discovery-cli metro-stats.json
```

---

## 2. JSON report from Rsdoctor

If you use [Rsdoctor](https://rsdoctor.rs/) to analyze your JS bundle,
you can simply generate a JSON report that can be used by `react-native-bundle-discovery`.


### Setup

1. Install packages:

```bash
yarn add -D react-native-bundle-discovery-ui
yarn add -D @rsdoctor/rspack-plugin
# or webpack version if used instead of rspack:
yarn add -D @rsdoctor/webpack-plugin
```

2. Register the [`RsdoctorRspackPlugin`](https://rsdoctor.rs/guide/start/quick-start#step-2-register-plugin) plugin with the following configuration:

```tsx
// rspack.config.mjs (or webpack.config.js)
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
// or import { RsdoctorWebpackPlugin } from '@rsdoctor/webpack-plugin';

export default Repack.defineRspackConfig({
  plugins: [
    process.env.RSDOCTOR && new RsdoctorRspackPlugin({ // or `RsdoctorWebpackPlugin`
      disableClientServer: true,
      output: {
        reportDir: '.',
        mode: 'brief',
        options: {type: ['json']},
      },
    })
  ].filter(Boolean),
});
```

3. Build the app with the `RSDOCTOR` environment variable:

```bash
# Re.Pack example:
RSDOCTOR=1 npx react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/assets --reset-cache
```

4. After the build, you will find the `rsdoctor-data.json` file in the root of your project.

5. Use that JSON file to analyze your JS bundle with `react-native-bundle-discovery`:

```bash
# Open UI
npx react-native-bundle-discovery-ui rsdoctor-data.json

# Or CLI interface
npx react-native-bundle-discovery-cli rsdoctor-data.json
```

### Known limitations

1. `rsdoctor-data.json` does not include the source code or bundled output code.

---

## Alternative tools: 

- https://re-pack.dev/docs/guides/bundle-analysis
