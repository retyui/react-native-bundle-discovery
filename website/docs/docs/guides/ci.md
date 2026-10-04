# Bundle size checks in CI

`compare` exits with code `1` when any check fails:

| Option               | Fails when                                                    | Example                         |
| -------------------- | ------------------------------------------------------------- | ------------------------------- |
| `--fail-on-increase` | The bundle grows more than the limit (bytes or % of "before") | `50KB`, `0.5MB`, `51200`, `5%`  |
| `--max-size`         | The "after" bundle is bigger than the limit                   | `3MB`                           |
| `--fail-on`          | New duplicate and/or deprecated packages appear               | `new-duplicates,new-deprecated` |

```bash
npx react-native-bundle-discovery-cli compare --before main-stats.json --after pr-stats.json \
  --fail-on-increase 50KB \
  --max-size 3MB \
  --fail-on new-duplicates,new-deprecated
```

## GitHub Actions

Works out of the box: the markdown report is added to the job summary and failed checks
are shown as error annotations.

```yaml
- run: npx react-native-bundle-discovery-cli compare --before main-stats.json --after pr-stats.json --fail-on-increase 5%
```

To post the report as a PR comment, use `--format markdown`.
