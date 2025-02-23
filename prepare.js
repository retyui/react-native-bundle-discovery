function prepare(data, { markers, crejectData, setWorkTitle }) {
  const moduleMap = new Map();

  data.modules.forEach((m) => {
    m.absolutePath = m.path;
    m.path = m.path.replace(data.rootFolder + "/", "");
    m.dependents = [];
    m.dependencies.forEach((d) => {
      d.path = d.absolutePath.replace(data.rootFolder + "/", "");
    });

    moduleMap.set(m.absolutePath, m);

    if (m.path === "__prelude__") {
      m.source.code = m.source.code
        .replaceAll(";", ";\n\n")
        .replaceAll(",", ",\n    ");
      m.output.code = m.output.code
        .replaceAll(";", ";\n\n")
        .replaceAll(",", ",\n    ");
    }
  });

  data.modules.forEach((m) => {
    m.dependencies.forEach((dependency) => {
      const dependentModule = moduleMap.get(dependency.absolutePath);
      if (dependentModule) {
        dependentModule.dependents.push(m); //add to the dependent module directly
      }
    });
  });

  return data;
}

module.exports = prepare;
