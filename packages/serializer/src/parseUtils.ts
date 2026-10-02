//////////////////////////////////////////////////////////////////////////////////////////
// Copy of: https://github.com/webpack/webpack-bundle-analyzer/blob/main/src/parseUtils.js
// Thanks to the Webpack maintainers! 🙏
//////////////////////////////////////////////////////////////////////////////////////////
import fs from "node:fs";
import type {
  BlockStatement,
  CallExpression,
  Expression,
  ExpressionStatement,
  Node,
  SpreadElement,
  VariableDeclaration,
} from "acorn";
import * as acorn from "acorn";
import * as walk from "acorn-walk";

function isNumericId(node: Expression): boolean {
  return (
    node.type === "Literal" &&
    node.value !== null &&
    node.value !== undefined &&
    Number.isInteger(node.value) &&
    (node.value as number) >= 0
  );
}

function isModuleId(node: Expression | SpreadElement | null): boolean {
  return (
    node !== null &&
    node.type === "Literal" &&
    (isNumericId(node) || typeof node.value === "string")
  );
}

function isModuleWrapper(node: Expression | SpreadElement): boolean {
  return (
    // It's an anonymous function expression that wraps module
    ((node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression") &&
      !node.id) ||
    // If `DedupePlugin` is used it can be an ID of duplicated module...
    isModuleId(node) ||
    // or an array of shape [<module_id>, ...args]
    (node.type === "ArrayExpression" &&
      node.elements.length > 1 &&
      isModuleId(node.elements[0]))
  );
}

function isModulesHash(node: Expression | SpreadElement | null): boolean {
  return (
    node !== null &&
    node.type === "ObjectExpression" &&
    node.properties
      .filter((property) => property.type !== "SpreadElement")
      .map((node) => node.value)
      .every(isModuleWrapper)
  );
}

function isModulesArray(node: Expression | SpreadElement | null): boolean {
  return (
    node !== null &&
    node.type === "ArrayExpression" &&
    node.elements.every(
      (elem) =>
        // Some of array items may be skipped because there is no module with such id
        !elem || isModuleWrapper(elem),
    )
  );
}

function isSimpleModulesList(node: Expression | SpreadElement | null): boolean {
  return (
    // Modules are contained in hash. Keys are module ids.
    isModulesHash(node) ||
    // Modules are contained in array. Indexes are module ids.
    isModulesArray(node)
  );
}

function isOptimizedModulesArray(
  node: Expression | SpreadElement | null,
): boolean {
  // Checking whether modules are contained in `Array(<minimum ID>).concat(...modules)` array:
  // https://github.com/webpack/webpack/blob/v1.14.0/lib/Template.js#L91
  // The `<minimum ID>` + array indexes are module ids
  return (
    node !== null &&
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    // Make sure the object called is `Array(<some number>)`
    node.callee.object.type === "CallExpression" &&
    node.callee.object.callee.type === "Identifier" &&
    node.callee.object.callee.name === "Array" &&
    node.callee.object.arguments.length === 1 &&
    node.callee.object.arguments[0].type !== "SpreadElement" &&
    isNumericId(node.callee.object.arguments[0]) &&
    // Make sure the property X called for `Array(<some number>).X` is `concat`
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "concat" &&
    // Make sure exactly one array is passed in to `concat`
    node.arguments.length === 1 &&
    isModulesArray(node.arguments[0])
  );
}

function isModulesList(node: Expression | SpreadElement | null): boolean {
  return (
    isSimpleModulesList(node) ||
    // Modules are contained in expression `Array([minimum ID]).concat([<module>, <module>, ...])`
    isOptimizedModulesArray(node)
  );
}

interface Location {
  start: number;
  end: number;
}

function getModuleLocation(node: Node): Location {
  return {
    start: node.start,
    end: node.end,
  };
}

type ModulesLocations = Record<string | number, Location>;

interface Webpack5IIFECandidate {
  locations: ModulesLocations;
  hasWebpackRuntime: boolean;
  isTopLevel: boolean;
}

function getModulesLocations(
  node: Expression | SpreadElement,
): ModulesLocations {
  if (node.type === "ObjectExpression") {
    // Modules hash
    const modulesNodes = node.properties;

    return modulesNodes.reduce((result, moduleNode) => {
      if (moduleNode.type !== "Property") {
        return result;
      }

      const moduleId =
        moduleNode.key.type === "Identifier"
          ? moduleNode.key.name
          : // @ts-expect-error need verify why we need it, tests not cover it case
            moduleNode.key.value;

      if (moduleId === "undefined") {
        return result;
      }

      result[moduleId] = getModuleLocation(moduleNode.value);

      return result;
    }, {} as ModulesLocations);
  }

  const isOptimizedArray = node.type === "CallExpression";

  if (node.type === "ArrayExpression" || isOptimizedArray) {
    // Modules array or optimized array
    const minId =
      isOptimizedArray &&
      node.callee.type === "MemberExpression" &&
      node.callee.object.type === "CallExpression" &&
      node.callee.object.arguments[0].type === "Literal"
        ? // Get the [minId] value from the Array() call first argument literal value
          (node.callee.object.arguments[0].value as number)
        : // `0` for simple array
          0;
    const modulesNodes = isOptimizedArray
      ? // The modules reside in the `concat()` function call arguments
        node.arguments[0].type === "ArrayExpression"
        ? node.arguments[0].elements
        : []
      : node.elements;

    return modulesNodes.reduce((result, moduleNode, i) => {
      if (moduleNode) {
        result[i + minId] = getModuleLocation(moduleNode);
      }

      return result;
    }, {} as ModulesLocations);
  }

  return {};
}

function getIIFECallExpression(
  node: ExpressionStatement,
): CallExpression | null {
  if (node.expression.type === "CallExpression") {
    return node.expression;
  }

  if (
    node.expression.type === "UnaryExpression" &&
    node.expression.argument.type === "CallExpression"
  ) {
    return node.expression.argument;
  }

  return null;
}

function callsModulesMap(node: Node, modulesVariableName: string): boolean {
  let callsModule = false;

  walk.simple(node, {
    CallExpression(callExpression) {
      const { callee } = callExpression;

      if (
        callee.type === "MemberExpression" &&
        ((callee.object.type === "Identifier" &&
          callee.object.name === modulesVariableName) ||
          (callee.object.type === "MemberExpression" &&
            callee.object.object.type === "Identifier" &&
            callee.object.object.name === modulesVariableName))
      ) {
        callsModule = true;
      }
    },
  });

  return callsModule;
}

function hasWebpackModulesRuntime(
  body: BlockStatement,
  modulesDeclaration: VariableDeclaration,
  modulesVariableName: string,
): boolean {
  const declarationIndex = body.body.indexOf(modulesDeclaration);

  return body.body
    .slice(declarationIndex + 1)
    .some((statement) => callsModulesMap(statement, modulesVariableName));
}

function getWebpack5IIFEModulesCandidate(
  node: CallExpression,
  isTopLevel: boolean,
): Webpack5IIFECandidate | null {
  if (
    node.arguments.length !== 0 ||
    (node.callee.type !== "FunctionExpression" &&
      node.callee.type !== "ArrowFunctionExpression") ||
    node.callee.params.length !== 0 ||
    node.callee.body.type !== "BlockStatement"
  ) {
    return null;
  }

  const firstVariableDeclaration = node.callee.body.body.find(
    (node) => node.type === "VariableDeclaration",
  );

  if (firstVariableDeclaration) {
    for (const declaration of firstVariableDeclaration.declarations) {
      if (declaration.init && isModulesList(declaration.init)) {
        const locations = getModulesLocations(declaration.init);

        if (Object.keys(locations).length === 0) {
          continue;
        }

        return {
          locations,
          hasWebpackRuntime:
            declaration.id.type === "Identifier" &&
            hasWebpackModulesRuntime(
              node.callee.body,
              firstVariableDeclaration,
              declaration.id.name,
            ),
          isTopLevel,
        };
      }
    }
  }

  return null;
}

function selectWebpack5IIFECandidate(
  candidates: Webpack5IIFECandidate[],
): Webpack5IIFECandidate | null {
  return (
    candidates.find(
      (candidate) => candidate.hasWebpackRuntime && candidate.isTopLevel,
    ) ||
    candidates.find((candidate) => candidate.hasWebpackRuntime) ||
    candidates.find((candidate) => candidate.isTopLevel) ||
    null
  );
}

function selectWebpack5IIFEModulesLocations(
  candidates: Webpack5IIFECandidate[],
  expectedModuleIds: (string | number)[] | undefined,
): ModulesLocations | null {
  if (candidates.length === 0) {
    return null;
  }

  if (expectedModuleIds?.length) {
    const expectedIds = new Set(expectedModuleIds.map(String));
    const rankedCandidates = candidates
      .map((candidate) => ({
        candidate,
        expectedIdsIntersection: Object.keys(candidate.locations).filter(
          (moduleId) => expectedIds.has(moduleId),
        ).length,
      }))
      .toSorted(
        (candidateA, candidateB) =>
          candidateB.expectedIdsIntersection -
          candidateA.expectedIdsIntersection,
      );

    if (rankedCandidates[0].expectedIdsIntersection > 0) {
      const bestCandidates = rankedCandidates
        .filter(
          (rankedCandidate) =>
            rankedCandidate.expectedIdsIntersection ===
            rankedCandidates[0].expectedIdsIntersection,
        )
        .map((rankedCandidate) => rankedCandidate.candidate);

      return selectWebpack5IIFECandidate(bestCandidates)?.locations || null;
    }
  }

  return selectWebpack5IIFECandidate(candidates)?.locations || null;
}

function isChunkIds(node: Expression): boolean {
  // Array of numeric or string ids. Chunk IDs are strings when NamedChunksPlugin is used
  return node.type === "ArrayExpression" && node.elements.every(isModuleId);
}

function mayBeAsyncChunkArguments(
  args: (Expression | SpreadElement | null)[],
): boolean {
  return (
    args.length >= 2 &&
    args[0] !== null &&
    args[0].type !== "SpreadElement" &&
    isChunkIds(args[0])
  );
}

/** Returns bundle source except modules */
function getBundleRuntime(
  content: string,
  modulesLocations: ModulesLocations | null,
): string {
  const sortedLocations = Object.values(modulesLocations || {}).toSorted(
    (a, b) => a.start - b.start,
  );

  let result = "";
  let lastIndex = 0;

  for (const { start, end } of sortedLocations) {
    result += content.slice(lastIndex, start);
    lastIndex = end;
  }

  return result + content.slice(lastIndex);
}

function isAsyncChunkPushExpression(node: CallExpression): boolean {
  const { callee, arguments: args } = node;

  return (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "push" &&
    callee.object.type === "AssignmentExpression" &&
    args.length === 1 &&
    args[0].type === "ArrayExpression" &&
    mayBeAsyncChunkArguments(args[0].elements) &&
    isModulesList(args[0].elements[1])
  );
}

function isAsyncWebWorkerChunkExpression(node: CallExpression): boolean {
  const { callee, type, arguments: args } = node;

  return (
    type === "CallExpression" &&
    callee.type === "MemberExpression" &&
    args.length === 2 &&
    args[0].type !== "SpreadElement" &&
    isChunkIds(args[0]) &&
    isModulesList(args[1])
  );
}

type Modules = Record<string, string>;

interface ParseBundleOptions {
  sourceType?: "script" | "module";
  expectedModuleIds?: (string | number)[];
}

interface WalkState {
  locations: ModulesLocations | null;
  webpack5IIFECandidates: Webpack5IIFECandidate[];
}

export function parseBundle(
  bundlePath: string,
  opts?: ParseBundleOptions,
): { modules: Modules; src: string; runtimeSrc: string } {
  const { sourceType = "script", expectedModuleIds } = opts || {};

  const content = fs.readFileSync(bundlePath, "utf8");
  const ast = acorn.parse(content, {
    sourceType,
    ecmaVersion: "latest",
  });

  const topLevelIIFECalls = new Set<CallExpression>();

  for (const node of ast.body) {
    if (node.type === "ExpressionStatement") {
      const iifeCall = getIIFECallExpression(node);

      if (iifeCall) {
        topLevelIIFECalls.add(iifeCall);
      }
    }
  }

  const walkState: WalkState = {
    locations: null,
    webpack5IIFECandidates: [],
  };

  walk.recursive(ast, walkState, {
    AssignmentExpression(node, state) {
      if (state.locations) return;

      // Modules are stored in exports.modules:
      // exports.modules = {};
      const { left, right } = node;

      if (
        left &&
        left.type === "MemberExpression" &&
        left.object &&
        left.object.type === "Identifier" &&
        left.object.name === "exports" &&
        left.property &&
        left.property.type === "Identifier" &&
        left.property.name === "modules" &&
        isModulesHash(right)
      ) {
        state.locations = getModulesLocations(right);
      }
    },

    CallExpression(node, state, callback) {
      if (state.locations) return;

      const args = node.arguments;
      const webpack5IIFEModulesCandidate = getWebpack5IIFEModulesCandidate(
        node,
        topLevelIIFECalls.has(node),
      );

      if (webpack5IIFEModulesCandidate) {
        state.webpack5IIFECandidates.push(webpack5IIFEModulesCandidate);
      }

      // Main chunk with webpack loader.
      // Modules are stored in first argument:
      // (function (...) {...})(<modules>)
      if (
        node.callee.type === "FunctionExpression" &&
        !node.callee.id &&
        args.length === 1 &&
        isSimpleModulesList(args[0])
      ) {
        state.locations = getModulesLocations(args[0]);
        return;
      }

      // Async Webpack < v4 chunk without webpack loader.
      // webpackJsonp([<chunks>], <modules>, ...)
      // As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
      if (
        node.callee.type === "Identifier" &&
        mayBeAsyncChunkArguments(args) &&
        args[1].type !== "SpreadElement" &&
        isModulesList(args[1])
      ) {
        state.locations = getModulesLocations(args[1]);
        return;
      }

      // Async Webpack v4 chunk without webpack loader.
      // (window.webpackJsonp=window.webpackJsonp||[]).push([[<chunks>], <modules>, ...]);
      // As function name may be changed with `output.jsonpFunction` option we can't rely on it's default name.
      if (
        isAsyncChunkPushExpression(node) &&
        args[0].type === "ArrayExpression" &&
        args[0].elements[1]
      ) {
        state.locations = getModulesLocations(args[0].elements[1]);
        return;
      }

      // Webpack v4 WebWorkerChunkTemplatePlugin
      // globalObject.chunkCallbackName([<chunks>],<modules>, ...);
      // Both globalObject and chunkCallbackName can be changed through the config, so we can't check them.
      if (isAsyncWebWorkerChunkExpression(node)) {
        state.locations = getModulesLocations(args[1]);
        return;
      }

      // Walking into arguments because some of plugins (e.g. `DedupePlugin`) or some Webpack
      // features (e.g. `umd` library output) can wrap modules list into additional IIFE.
      for (const arg of args) {
        callback(arg, state);
      }
    },
  });

  const modulesLocations =
    walkState.locations ||
    selectWebpack5IIFEModulesLocations(
      walkState.webpack5IIFECandidates,
      expectedModuleIds,
    );
  const modules: Modules = {};

  if (modulesLocations) {
    for (const [id, loc] of Object.entries(modulesLocations)) {
      modules[id] = content.slice(loc.start, loc.end);
    }
  }

  return {
    modules,
    src: content,
    runtimeSrc: getBundleRuntime(content, modulesLocations),
  };
}
