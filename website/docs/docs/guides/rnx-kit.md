# rnx-kit (esbuild metafile)

With [`@rnx-kit/metro-serializer-esbuild`](https://github.com/microsoft/rnx-kit/tree/main/packages/metro-serializer-esbuild) (tree shaking), ask it to write an [esbuild metafile](https://esbuild.github.io/api/#metafile) via the `treeShake` options in `package.json`:

```json title="package.json"
{
  "rnx-kit": {
    "bundle": {
      "treeShake": {
        "metafile": "esbuild-meta.json"
      }
    }
  }
}
```

Then create a production bundle with `react-native rnx-bundle --platform ios --dev false` (the path to the metafile is printed in the build log).

The UI and CLI accept the metafile as is (sizes are after tree shaking and minification):

```bash
npx react-native-bundle-discovery-ui esbuild-meta.json
npx react-native-bundle-discovery-cli esbuild-meta.json
```

:::info Notes
The metafile does not include source/output code, and its paths are relative to the directory the bundle was built from (the metafile folder, its parents and the current directory are tried).
:::
