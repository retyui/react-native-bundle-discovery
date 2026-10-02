import type {
  BundleReport,
  ReportModule,
  ReportModuleDependency,
  ReportPackage,
} from "@react-native-bundle-discovery/shared";

// Fields added to the report by `prepare()` (data is mutated in place)
export interface PreparedPackage extends ReportPackage {
  path: string;
}

export interface PreparedDependency extends ReportModuleDependency {
  path: string;
}

export interface PreparedModule extends Omit<ReportModule, "dependencies"> {
  absolutePath: string;
  isEntry?: boolean;
  dependencies: PreparedDependency[];
  dependents: PreparedModule[];
  duplicates: PreparedModule[];
  _tmp_ids?: string[];
}

export interface PreparedReport
  extends Omit<BundleReport, "packages" | "modules"> {
  packages: PreparedPackage[];
  modules: PreparedModule[];
}

function getDuplicateId(path: string) {
  const uniqueNodeModulePath = path.split("node_modules/").pop() as string;
  const ids = [uniqueNodeModulePath];

  // Special case for lodash
  if (
    uniqueNodeModulePath.startsWith("lodash.") ||
    uniqueNodeModulePath.startsWith("lodash-es/")
  ) {
    // node_modules/lodash.debounce/index.js => node_modules/lodash/debounce.js
    // node_modules/lodash-es/get.js         => node_modules/lodash/get.js
    const uniqueLodashPath = uniqueNodeModulePath
      .replace("lodash-es/", "lodash/")
      .replace("lodash.", "lodash/")
      .replace("/index.js", ".js");

    ids.push(uniqueLodashPath);
  }

  return ids;
}

function prepare(input: BundleReport): PreparedReport {
  // `prepare` mutates the report in place, adding the `Prepared*` fields
  const data = input as unknown as PreparedReport;
  // data.modules = data.modules.slice(875, 880); TODO for debugging a formtree chart
  const moduleMap = new Map<string, PreparedModule>();
  const duplicatesMap = new Map<string, PreparedModule[]>();
  const allLodashModules = new Set<PreparedModule>();

  data.packages.forEach((pkg) => {
    pkg.path = pkg.absolutePath.replace(`${data.rootFolder}/`, "");
  });
  data.modules.forEach((m) => {
    // 0. Data transformation
    m.absolutePath = m.path;
    if (m.absolutePath === data.entryPoint) {
      m.isEntry = true;
    }
    m.path = m.path.replace(`${data.rootFolder}/`, "");
    m.dependencies.forEach((d) => {
      d.path = d.absolutePath.replace(`${data.rootFolder}/`, "");
    });

    // 1. Duplicates
    m._tmp_ids = getDuplicateId(m.path);
    m.duplicates = [];
    m._tmp_ids.forEach((id) => {
      if (!duplicatesMap.has(id)) {
        duplicatesMap.set(id, []);
      }
      (duplicatesMap.get(id) as PreparedModule[]).push(m);
    });
    // lodash/*
    // lodash-es/*
    // lodash.*
    if (m.path.includes("node_modules/lodash")) {
      allLodashModules.add(m);
    }

    // 2. Dependencies
    m.dependents = [];
    moduleMap.set(m.absolutePath, m);

    // 3. Other
    // 3.1 Format prelude
    if (m.path === "__prelude__") {
      m.source.code = m.source.code
        .replaceAll(";", ";\n\n")
        .replaceAll(",", ",\n    ");
    }
  });

  data.modules.forEach((m) => {
    // 1. Duplicates
    (m._tmp_ids as string[]).forEach((id) => {
      const duplicates = duplicatesMap.get(id) as PreparedModule[];
      if (duplicates.length > 1) {
        m.duplicates.push(...duplicates.filter((d) => d !== m));
      }
    });

    // lodash/index.js is a special case (as index.js includes all lodash functions)
    if (m.path.endsWith("node_modules/lodash/index.js")) {
      m.duplicates.push(...allLodashModules);
    }
    delete m._tmp_ids;

    // 2. Dependencies
    m.dependencies.forEach((dependency) => {
      const dependentModule = moduleMap.get(dependency.absolutePath);
      if (dependentModule) {
        dependentModule.dependents.push(m); //add to the dependent module directly
      }
    });
  });

  return data;
}

export default prepare;
