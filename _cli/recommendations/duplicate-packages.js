const { getPackageGroups } = require("../packages.js");

module.exports = {
  id: "duplicate-packages",
  title: "Deduplicate repeated packages in the bundle",
  check(report) {
    const packageGroups = getPackageGroups(report, "size");
    const duplicateGroups = packageGroups.filter((group) => group.entries.length > 1);

    if (duplicateGroups.length === 0) {
      return null;
    }

    const packages = duplicateGroups.map(({ name, entries }) => {
      const versions = Array.from(new Set(entries.map((entry) => `${entry.name}@${entry.version}`)));
      return `${name} x${entries.length}: ${versions.join(", ")}`;
    });


    return {
      packages,
      message: `Found ${duplicateGroups.length} duplicate package group(s). Align versions or use dependency overrides (npm) or resolutions (yarn) to keep a single copy per package group. Use a "${require('../package.json').name} packages <file>" command to see more...`,
      docsUrl: ["https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides", "https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/"],
    };
  },
};

