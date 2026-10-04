# CLI

Requires `react-native-bundle-discovery-cli`. Run any command with `--help` to see all options.

| Command    | Description                                   |
| ---------- | --------------------------------------------- |
| _(none)_   | Show recommended optimizations for the bundle |
| `packages` | List all packages in the bundle               |
| `modules`  | List the heaviest modules                     |
| `compare`  | Compare two reports                           |

```bash
# Recommended optimizations, each with an estimated saving
# (with --format json each finding also has `sizeInBytes` and the affected `modules`)
npx react-native-bundle-discovery-cli metro-stats.json [--format json|default]

# All packages
npx react-native-bundle-discovery-cli packages metro-stats.json [--sort size|name] [--format json|table|default]

# Heaviest modules (default --limit: 50, use 0 to show all)
# --filter accepts plain text (case-insensitive) or a regexp, e.g. --filter '/\.json/i'
npx react-native-bundle-discovery-cli modules metro-stats.json [--limit 50] [--filter <text|/regexp/>] [--sort size|name] [--format json|table|default]

# Diff two reports: total size, added/removed/changed modules and packages,
# version changes, new duplicates and new deprecated packages
npx react-native-bundle-discovery-cli compare --before main-stats.json --after pr-stats.json [--limit 50] [--format json|markdown|default]
```

To fail CI on bundle size regressions, see [Bundle size checks in CI](/docs/guides/ci).
