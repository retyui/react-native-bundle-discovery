# Introduction

Visualize and analyze the JS bundle of your React Native app. Find heavy packages, duplicates and deprecated
dependencies, inspect every module, and catch bundle size regressions in CI.

![Bundle Discovery UI: Treemap, Insights and Packages tabs](/img/overview.jpg)

## Features

- 📊 Interactive UI to explore packages, modules and their source/bundled code
- 💡 Optimization recommendations ranked by estimated savings (duplicates, deprecated / outdated / dev-only packages, and more)
- 🗺️ Treemap colored by package, file type or issues, and an "Imported by" graph for every module
- ❓ "Why is this in my bundle?": the shortest import chain to any package
- 🔍 CLI to list the heaviest packages and modules
- 🆚 Compare two reports in the UI (with per-module code diffs) or in CI, and fail on bundle size regressions
- 🧩 Works with Metro, [Re.Pack](/docs/guides/repack) and [React Native DevTools](/docs/guides/rozenite) (via Rozenite)

## Packages

| Package                                         | What it does                                                                                    | Required |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| `react-native-bundle-discovery`                 | Generates a JSON report (`metro-stats.json`) of your bundle                                     | ✅ Yes   |
| `react-native-bundle-discovery-ui`              | Shows the report in the browser                                                                 | Optional |
| `react-native-bundle-discovery-cli`             | Analyzes and compares reports in the terminal / CI                                              | Optional |
| `react-native-bundle-discovery-rozenite-plugin` | Shows the UI inside [React Native DevTools](https://reactnative.dev/docs/react-native-devtools) | Optional |
