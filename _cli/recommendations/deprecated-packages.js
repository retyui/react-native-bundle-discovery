function findDeprecatedPackages(report) {
  const matches = new Map();

  for (const pkg of report.packages) {
    const deprecated = pkg?.metadata?.deprecated;
    if (!deprecated) {
      continue;
    }

    const id = `${pkg.name}@${pkg.version}`;
    if (!matches.has(id)) {
      matches.set(id, {
        id,
        reason: typeof deprecated === "string" ? deprecated.trim() : null,
        latestVersion: pkg.metadata.latestVersion ?? null,
      });
    }
  }

  return Array.from(matches.values());
}

module.exports = {
  findDeprecatedPackages,
  id: "deprecated-packages",
  title: "Replace deprecated packages",
  check: (report) => {
    const deprecatedPackages = findDeprecatedPackages(report);

    if (deprecatedPackages.length === 0) {
      return null;
    }

    const details = deprecatedPackages
      .map(({ id, reason, latestVersion }) => {
        const latest = latestVersion ? ` (latest: ${latestVersion})` : "";
        return reason ? ` - ${id}${latest}: ${reason}` : ` - ${id}${latest}`;
      })
      .join("\n");

    return {
      message: `Detected ${deprecatedPackages.length} deprecated package(s) in the bundle:
${details}

Deprecated packages are no longer maintained and may contain bugs or security issues.
Upgrade to a non-deprecated version or migrate to the recommended replacement.
`,
      packages: deprecatedPackages.map(({ id }) => id),
      docsUrl:
        "https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions",
    };
  },
};
