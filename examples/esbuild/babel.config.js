const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        // esbuild tree shaking needs ES modules (https://github.com/microsoft/rnx-kit/tree/main/packages/metro-serializer-esbuild#manual-metro-setup)
        disableImportExportTransform:
          env === 'production' && process.env.RNX_METRO_SERIALIZER_ESBUILD,
      },
    ],
  ],
  // Transform Flow enums before the preset's flow-strip-types removes them,
  // otherwise esbuild fails on `import {VirtualViewMode} from '.../VirtualView'`
  plugins: ['babel-plugin-transform-flow-enums'],
};
