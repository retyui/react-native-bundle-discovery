const MAX_AGE_YEARS = 4;
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function findOutdatedPackages(report, now = Date.now()) {
  const matches = new Map();

  for (const pkg of report.packages) {
    const metadata = pkg?.metadata;
    // Deprecated packages are reported by the `deprecated-packages` recommendation
    if (!metadata || metadata.isLatest || metadata.deprecated) {
      continue;
    }

    const createdAt = Date.parse(metadata.createdAt);
    if (Number.isNaN(createdAt)) {
      continue;
    }

    const ageInYears = (now - createdAt) / MS_PER_YEAR;
    if (ageInYears < MAX_AGE_YEARS) {
      continue;
    }

    const id = `${pkg.name}@${pkg.version}`;
    if (!matches.has(id)) {
      matches.set(id, {
        id,
        createdAt: metadata.createdAt,
        ageInYears,
        latestVersion: metadata.latestVersion ?? null,
      });
    }
  }

  return Array.from(matches.values()).sort(
    (a, b) => b.ageInYears - a.ageInYears,
  );
}

module.exports = {
  id: "outdated-packages",
  title: "Update outdated packages",
  findOutdatedPackages,
  check: (report) => {
    const outdatedPackages = findOutdatedPackages(report);

    if (outdatedPackages.length === 0) {
      return null;
    }

    const details = outdatedPackages
      .map(({ id, createdAt, ageInYears, latestVersion }) => {
        const published = `published ${createdAt.slice(0, 10)}, ${ageInYears.toFixed(1)} years ago`;
        const latest = latestVersion ? `, latest: ${latestVersion}` : "";
        return ` - ${id} (${published}${latest})`;
      })
      .join("\n");

    return {
      message: `Detected ${outdatedPackages.length} outdated package(s) in the bundle:
${details}

Old package versions miss bug fixes, performance and bundle size improvements, and may contain known security issues.
Upgrade them to the latest version or consider a maintained alternative.
`,
      packages: outdatedPackages.map(({ id }) => id),
    };
  },
};
