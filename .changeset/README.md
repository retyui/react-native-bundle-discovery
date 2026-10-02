# Changesets

Every user-facing change should come with a changeset:

```bash
yarn changeset
```

Pick the packages, the bump type (patch / minor / major) and write a short summary.
Commit the generated `.changeset/*.md` file together with your change.

All published packages are versioned together (`fixed` group in `config.json`).
On every push to `main` the [Release workflow](../.github/workflows/release.yml) opens
(or updates) a "Version Packages" PR; merging it publishes the packages to npm and
creates GitHub releases.
