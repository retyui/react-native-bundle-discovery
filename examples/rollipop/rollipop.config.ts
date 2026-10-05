import { bundleDiscoveryRollipopPlugin } from 'react-native-bundle-discovery';
import { defineConfig } from 'rollipop';

export default defineConfig({
  treeshake: true,
  output: {
    minify: true,
  },
  plugins: [
    // Writes metro-stats.json (`yarn build-ios` / `yarn build-android` set BUNDLE_ANALYZER)
    bundleDiscoveryRollipopPlugin({ enabled: !!process.env.BUNDLE_ANALYZER }),
  ],
});
