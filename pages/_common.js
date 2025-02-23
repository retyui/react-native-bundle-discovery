const platformColor = `transformOptions.platform = 'android' ? 'rgba(194, 239, 116, .4)' : 'rgba(119, 31, 218, .4)'`;

module.exports = {
  metadata: {
    platform: {
      when: "transformOptions.platform",
      view: "badge",
      data: `{ prefix: 'Platform: ', text: transformOptions.platform, color: ${platformColor} }`,
    },
    size: {
      when: "modules.filter(=> $.path has 'node_modules').size()",
      view: "badge",
      data: `{ prefix: 'Size: ', text: modules.output.sizeInBytes.sum().formatBytes(), color: ${platformColor} }`,
    },
    node_modules_size: {
      when: "modules.filter(=> $.path has 'node_modules').size()",
      view: "badge",
      data: "{ prefix: 'node_modules: ', text: modules.filter(=> $.path has 'node_modules').output.sizeInBytes.sum().formatBytes(), color: 'rgba(255, 0, 0, 0.35)' }",
    },
    source_code_size: {
      when: "modules.filter(=> $.path has 'node_modules').size()",
      view: "badge",
      data: `
        // vars
        $totalSize: modules.output.sizeInBytes.sum();
        $thirdPartySize: modules.filter(=> $.path has 'node_modules').output.sizeInBytes.sum();
        // return data
        { prefix: 'Source code: ', text: ($totalSize - $thirdPartySize).formatBytes(), color: 'rgba(148, 111, 234, 0.5)' }`,
    },
    is_dev: {
      when: "transformOptions.dev != null",
      view: "badge",
      data: "{ prefix: '__DEV__: ', text: transformOptions.dev }",
    },
    is_minified: {
      when: "transformOptions.minify != null",
      view: "badge",
      data: "{ prefix: 'Minify: ', text: transformOptions.minify }",
    },
  },
};
