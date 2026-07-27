const { getPackageGroups, LODASH_FAMILY_GROUP } = require("../packages.js");

module.exports = {
  id: "duplicate-packages",
  title: "Deduplicate repeated packages in the bundle",
  check(report) {
    const packageGroups = getPackageGroups(report, "size");
    const duplicateGroups = packageGroups.filter((group) => group.entries.length > 1);

    if (duplicateGroups.length === 0) {
      return null;
    }

    return duplicateGroups.map((group) => {
      const {name, entries} = group;
      const versions = Array.from(new Set(entries.map((entry) => `${entry.name}@${entry.version} (${entry.path})`)));
      const packages = `${name === LODASH_FAMILY_GROUP ? 'lodash' : name} x${entries.length}:\n             - ${versions.join("\n             - ")}`;
      const hasDotLodash = entries.some(e =>e.name.startsWith("lodash."));
      const hasESLodash = entries.some(e =>e.name === 'lodash-es');
      const hasSimpleLodash = entries.some(e => e.name === "lodash");
      const hasUnderscore = entries.some(e => e.name === 'underscore');
      const hasRamda = entries.some(e => e.name === 'ramda');

      const message = [
        hasDotLodash && hasSimpleLodash && "You can simply use `lodash/*` imports and remove `lodash.*` packages",
        hasESLodash && hasSimpleLodash && "You don't need two copy of `lodash` and `lodash-es`! Just use one",
        hasUnderscore && "You have both `underscore` and `lodash` in your project. Consider using only one library to reduce bundle size.",
        hasRamda && "You have both `ramda` and `lodash` in your project. Consider using only one library to reduce bundle size.",
      ].filter(Boolean).join("; ");

      if(name === LODASH_FAMILY_GROUP){
        return {
          packages,
          message,
          docsUrl: null,
        }
      }

      return {
        packages,
        message: `Found ${duplicateGroups.length} duplicate packages. Align versions or use dependency overrides (npm) / resolutions (yarn) to keep a single copy per package. Use a "${require('../package.json').name} packages <file>" command to see more...`,
        docsUrl: ["https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides", "https://classic.yarnpkg.com/lang/en/docs/selective-version-resolutions/"],
      };
    })
  },
};
