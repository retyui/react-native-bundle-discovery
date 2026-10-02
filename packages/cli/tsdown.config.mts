import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/bin.ts"],
  format: "cjs",
  platform: "node",
  target: "node18",
  fixedExtension: false,
  // `@react-native-bundle-discovery/shared` is a private devDependency, so it is inlined
  deps: { onlyBundle: false },
});
