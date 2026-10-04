import { defineConfig } from "tsdown";

export default defineConfig([
  // Node side: CLI + discovery.js config
  {
    entry: ["src/bin.ts", "src/discoveryrc.ts", "src/rsdoctor.ts"],
    format: "cjs",
    platform: "node",
    target: "node18",
    fixedExtension: false,
    // `@react-native-bundle-discovery/shared` is a private devDependency, so it is inlined
    deps: { onlyBundle: false },
  },
  // Browser side: files are bundled later by discovery.js (esbuild), so emit them 1:1
  {
    entry: ["src/client/**/*.ts", "!src/client/**/*.d.ts"],
    outDir: "dist/client",
    unbundle: true,
    format: "cjs",
    platform: "browser",
    target: "es2022",
    fixedExtension: false,
    clean: false,
    deps: {
      neverBundle: [/\/vendors\//, /^prettier/, /^d3-/],
      onlyBundle: false,
    },
  },
]);
