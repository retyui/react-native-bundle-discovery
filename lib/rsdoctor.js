const { resolve } = require("path");

const possibleEntryFiles = [
  "index.js",
  "index.jsx",
  "index.ts",
  "index.tsx",
  "index.mjs",
  "index.cjs",
];

const doStructureCheck = (rsdoctorData) => {
  if (!(
    Array.isArray(rsdoctorData?.data?.configs) &&
    rsdoctorData.data.configs.length === 1
  )) {
    throw new Error(
      `Unexpected number of "data.configs[]" in rsdoctor-data.json. Work only with single config. Found: ${rsdoctorData?.data?.configs?.length}`,
    );
  }

  if (!Array.isArray(rsdoctorData?.data?.packageGraph?.packages)) {
    throw new Error(
      `Unexpected "data.packageGraph.packages[]" in rsdoctor-data.json. Expected array. Found: ${typeof rsdoctorData?.data?.packageGraph?.packages}`,
    );
  }

  const firstConfig = rsdoctorData.data.configs[0];

  if (!(firstConfig.name === "rspack" || firstConfig.name === "webpack")) {
    throw new Error(
      `Unsupported bundler: ${firstConfig.name}@${firstConfig.version}. Only 'rspack' and 'webpack' are supported.`,
    );
  }
};

const getDependenciesMap = (rsdoctorData) => {
  const depsMap = new Map(
    rsdoctorData.data.moduleGraph.dependencies.map((dep) => [dep.id, dep]),
  );
  return depsMap;
};

const getEntryFile = (rsdoctorData) => {
  const firstConfig = rsdoctorData?.data?.configs?.[0];
  const entry = firstConfig?.config?.entry;
  const entryFile =
    typeof entry?.main === "string"
      ? entry.main
      : typeof entry?.main?.import === "string"
        ? entry.main.import
        : entry?.main.import[0];

  if (entryFile) {
    return resolve(firstConfig.root, entryFile);
  }

  const pathsToCheck = possibleEntryFiles.map((f) =>
    resolve(firstConfig.root, f),
  );
  const indexFile = rsdoctorData.data.moduleGraph.modules.find((mdl) =>
    pathsToCheck.some((entry) => mdl.path === entry),
  );

  if (indexFile && indexFile.imported?.length === 0) {
    return indexFile.path;
  }

  return `${firstConfig.root}/index.js`;
};

const transformRSDoctorData = (rsdoctorData) => {
  doStructureCheck(rsdoctorData);
  const tmpDependenciesMap = getDependenciesMap(rsdoctorData);
  const firstConfig = rsdoctorData.data.configs[0];
  return {
    date: Date.now(), // no info in rspack report
    entryPoint: getEntryFile(rsdoctorData),
    rootFolder: firstConfig.root,
    // envs: {},
    transformOptions: {
      // customTransformOptions: {},
      dev: firstConfig.config.mode !== "production",
      minify: firstConfig.config.optimization?.minimize ?? false,
      platform: firstConfig.config.name ?? "ios",
      // type: "module",
      // unstable_transformProfile: "default",
    },
    // Example of package:
    // {
    //   name: "@react-native/js-polyfills",
    //   absolutePath:
    //     "/Users/xd/tmp/RN84/node_modules/@react-native/js-polyfills",
    //   version: "0.84.1",
    // }
    packages: rsdoctorData.data.packageGraph.packages.map((pkg) => ({
      name: pkg.name,
      absolutePath: pkg.root,
      version: pkg.version,
      source: { sizeInBytes: pkg.size?.sourceSize ?? 1 },
      output: { sizeInBytes: pkg.size?.parsedSize ?? 1 },
    })),
    // Example of module:
    // {
    //   "path": "/Users/xd/tmp/RN84/node_modules/react-native/Libraries/BatchedBridge/BatchedBridge.js",
    //   "source": {
    //     "code": "",
    //     "lineCount": 32,
    //     "sizeInBytes": 954
    //   },
    //   "output": {
    //     "code": "",
    //     "lineCount": 1,
    //     "sizeInBytes": 219
    //   },
    //   "dependencies": [
    //     {
    //       "absolutePath": "/Users/xd/tmp/RN84/node_modules/react-native/Libraries/BatchedBridge/MessageQueue.js",
    //       "name": "./MessageQueue"
    //     }
    //   ]
    // },
    modules: rsdoctorData.data.moduleGraph.modules.map((mdl) => ({
      path: mdl.path,
      source: {
        code: "", // no code in rspack report
        lineCount: 0, // no code to count lines in rspack report
        sizeInBytes: mdl.size?.sourceSize ?? 0,
      },
      output: {
        code: "",
        lineCount: 0,
        sizeInBytes: mdl.size?.parsedSize ?? 0,
      },
      dependencies: mdl.dependencies
        .map((depNumId) => {
          const dep = tmpDependenciesMap.get(depNumId);
          return dep
            ? { absolutePath: dep.resolvedRequest, name: dep.request }
            : null;
        })
        .filter((e) => e !== null),
    })),
  };
};

module.exports = {
  transformRSDoctorData,
};
