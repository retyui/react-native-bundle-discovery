import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "cjs",
  platform: "node",
  target: "node18",
  fixedExtension: false,
  dts: true,
});
