const { withRozenite } = require('@rozenite/metro');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { createSerializer } = require('react-native-bundle-discovery');
const {
  withRozeniteBundleDiscoveryPlugin,
} = require('react-native-bundle-discovery-rozenite-plugin');

const isRozeniteEnabled = process.env.WITH_ROZENITE === 'true';

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = isRozeniteEnabled
  ? {}
  : {
      // Release bundles (`yarn build-ios` / `yarn build-android`) write metro-stats.json
      serializer: {
        customSerializer: createSerializer({ projectRoot: __dirname }),
      },
    };

module.exports = withRozenite(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    enabled: isRozeniteEnabled,
    enhanceMetroConfig: metroConfig =>
      withRozeniteBundleDiscoveryPlugin(metroConfig, {
        projectRoot: __dirname,
      }),
  },
);
