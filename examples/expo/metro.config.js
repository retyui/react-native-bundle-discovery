const { getDefaultConfig } = require('expo/metro-config');
const { createSerializer } = require('react-native-bundle-discovery');

const config = getDefaultConfig(__dirname);

// Wrap Expo's serializer to write metro-stats.json
config.serializer.customSerializer = createSerializer({
  projectRoot: __dirname,
  // `expo export:embed` force-exits before the background npm metadata fetch
  // finishes, so the report would never be written
  fetchPackagesMetadata: false,
  serializer: config.serializer.customSerializer,
});

module.exports = config;
