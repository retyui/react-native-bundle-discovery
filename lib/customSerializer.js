const fs = require('fs');
const path = require('path');
const {Buffer} = require('buffer');

const bundleToString = require("metro/src/lib/bundleToString");
const baseJSBundle = require("metro/src/DeltaBundler/Serializers/baseJSBundle");

const defaultSerializer = (entryPoint, preModules, graph, options) => bundleToString(baseJSBundle(entryPoint, preModules, graph, options)).code;

function getStringSizeInBytes(str) {
    return Buffer.byteLength(str, 'utf8');
}


function customSerializer(entryPoint, preModules, graph, options) {
    const code = defaultSerializer(entryPoint, preModules, graph, options);

    // TODO FIXME
    // const projectRoot = __dirname;
    // const monorepoRoot = path.resolve(projectRoot, '../../');
    const dependencies = Array.from(graph.dependencies.values());
    const toJsonModule = m => {
        const sourceCode = m.getSource().toString('utf8');
        const outputCode = m.output[0].data.code;
        return ({
            path: m.path,
            source: {
                code: sourceCode,
                lineCount: sourceCode.split('\n').length,
                sizeInBytes: getStringSizeInBytes(sourceCode),
            },
            output: {
                code: outputCode,
                sizeInBytes: getStringSizeInBytes(outputCode),
                lineCount: m.output[0].data.lineCount,
            },
            dependencies: Array.from(m?.dependencies?.values?.() ?? []).map(e => ({
                absolutePath: e.absolutePath,
                name: e.data.name,
            }))
        })
    };

    const stats = {
        projectRoot,
        monorepoRoot,
        entryPoint,
        transformOptions: graph.transformOptions,
        modules: preModules.map(toJsonModule).concat(dependencies.map(toJsonModule)),
        bundleCode: code,
    };

    const outputJsonPath = path.resolve(__dirname, '..', '..', 'rn-stats.json'); // FIXME

    fs.writeFileSync(outputJsonPath, JSON.stringify(stats));

    console.log('[react-native-bundle-discovery]: Saved stats to', outputJsonPath);

    return code;
}


module.exports = {customSerializer};
