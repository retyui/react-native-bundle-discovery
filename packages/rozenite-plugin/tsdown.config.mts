import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/react-native.ts"],
  format: "cjs",
  platform: "node",
  target: "node18",
  fixedExtension: false,
  dts: true,
  copy: ["public/index.html", "public/style.css", "public/rozenite.json"],
});
