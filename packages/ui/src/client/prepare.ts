import type {
  RecommendationFinding,
  ReportModule,
  ReportModuleDependency,
  ReportPackage,
  ReportWithRecommendations,
} from "@react-native-bundle-discovery/shared";
import { DUPLICATE_ISSUE } from "./issues";

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
  /** Titles of recommendations that remove this module (and "Duplicate module") */
  issues?: string[];
  _tmp_ids?: string[];
}

export interface PreparedReport
  extends Omit<ReportWithRecommendations, "packages" | "modules"> {
  packages: PreparedPackage[];
  modules: PreparedModule[];
}

function addIssue(module: PreparedModule, issue: string) {
  module.issues ??= [];
  if (!module.issues.includes(issue)) {
    module.issues.push(issue);
  }
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

function prepare(input: ReportWithRecommendations): PreparedReport {
  // `prepare` mutates the report in place, adding the `Prepared*` fields
  const data = input as unknown as PreparedReport;
  // data.modules = data.modules.slice(875, 880); TODO for debugging a formtree chart
  const moduleMap = new Map<string, PreparedModule>();
  const duplicatesMap = new Map<string, PreparedModule[]>();
  const allLodashModules = new Set<PreparedModule>();

  // Missing for reports loaded without `withRecommendations()`
  data.recommendations ??= null;
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
    if (m.duplicates.length > 0) {
      addIssue(m, DUPLICATE_ISSUE);
    }

    // 2. Dependencies
    m.dependencies.forEach((dependency) => {
      const dependentModule = moduleMap.get(dependency.absolutePath);
      if (dependentModule) {
        dependentModule.dependents.push(m); //add to the dependent module directly
      }
    });
  });

  // 3. Recommendations: relative module paths + `issues` on the modules
  // (only for findings with savings, i.e. the modules can be removed)
  const modulesByPath = new Map(data.modules.map((m) => [m.absolutePath, m]));
  data.recommendations?.forEach((finding: RecommendationFinding) => {
    finding.modules = finding.modules?.map((path) => {
      const module = modulesByPath.get(path);
      if (module && finding.sizeInBytes) {
        addIssue(module, finding.title);
      }
      return module?.path ?? path;
    });
  });

  return data;
}

export default prepare;
