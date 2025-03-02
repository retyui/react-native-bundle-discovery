const { writeFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { Buffer } = require("node:buffer");

const NAME = require("../package.json").name;

function getDefaultSerializer() {
  const bundleToString = require("metro/src/lib/bundleToString");
  const baseJSBundle = require("metro/src/DeltaBundler/Serializers/baseJSBundle");

  return (entryPoint, preModules, graph, options) =>
    bundleToString(baseJSBundle(entryPoint, preModules, graph, options)).code;
}

function getStringSizeInBytes(str) {
  return Buffer.byteLength(str, "utf8");
}

function toModuleStruct(m, includeCode) {
  const sourceCode = m.getSource().toString("utf8");
  const outputCode = m.output[0].data.code;
  return {
    path: m.path,
    source: {
      code: includeCode ? sourceCode : "",
      lineCount: sourceCode.split("\n").length,
      sizeInBytes: getStringSizeInBytes(sourceCode),
    },
    output: {
      code: includeCode ? outputCode : "",
      lineCount: m.output[0].data.lineCount,
      sizeInBytes: getStringSizeInBytes(outputCode),
    },
    dependencies: Array.from(m?.dependencies?.values?.() ?? []).map((e) => ({
      absolutePath: e.absolutePath,
      name: e.data.name,
    })),
  };
}

function createJsonReport({
  graph,
  entryPoint,
  includeEnvs,
  preModules,
  includeCode,
  outputJsonPath,
  rootFolder,
}) {
  const dependencies = Array.from(graph.dependencies.values());

  const stats = {
    date: Date.now(),
    entryPoint,
    transformOptions: graph.transformOptions,
    envs: includeEnvs.reduce((acc, envName) => {
      acc[envName] = process.env[envName];
      return acc;
    }, {}),
    rootFolder,
    modules: preModules
      .map((m) => toModuleStruct(m, includeCode))
      .concat(dependencies.map((m) => toModuleStruct(m, includeCode))),
  };

  writeFileSync(outputJsonPath, JSON.stringify(stats));

  console.log(`[${NAME}]: Saved stats to`, outputJsonPath);
}

function createSerializer({
  serializer,
  projectRoot,
  outputJsonPath,
  includeCode = true,
  includeEnvs = [],
} = {}) {
  const mySerializer = serializer || getDefaultSerializer();

  if (!existsSync(projectRoot)) {
    throw new Error(`[${NAME}]: Project root does not exist: ${projectRoot}`);
  }

  const myOutputJsonPath =
    outputJsonPath ?? resolve(projectRoot, "metro-stats.json");

  function customSerializer(entryPoint, preModules, graph, options) {
    const code = mySerializer(entryPoint, preModules, graph, options);

    createJsonReport({
      graph,
      entryPoint,
      includeEnvs,
      preModules,
      includeCode,
      outputJsonPath: myOutputJsonPath,
      rootFolder: projectRoot,
    });

    return code;
  }

  return customSerializer;
}

module.exports = { createSerializer };
