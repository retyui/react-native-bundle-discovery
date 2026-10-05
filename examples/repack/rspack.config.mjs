import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import { BundleDiscoveryPlugin } from 'react-native-bundle-discovery';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  resolve: {
    // RN 0.87 packages (e.g. @react-native/asset-utils) only define "exports"
    ...Repack.getResolveOptions({ enablePackageExports: true }),
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin(),
    // Writes metro-stats.json (`yarn build-ios` / `yarn build-android` set BUNDLE_ANALYZER)
    new BundleDiscoveryPlugin({ enabled: !!process.env.BUNDLE_ANALYZER }),
  ],
});
