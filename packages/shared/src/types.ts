/**
 * Shape of the `metro-stats.json` report produced by `react-native-bundle-discovery`
 * (Metro serializer / Webpack plugin) and consumed by the UI and CLI.
 */

export interface PackageMetadata {
  createdAt: string | null;
  deprecated: string | false;
  isLatest: boolean;
  latestVersion: string | null;
}

export interface SizeInfo {
  sizeInBytes: number;
}

export interface CodeInfo extends SizeInfo {
  code: string;
  lineCount: number;
}

export interface ReportPackage {
  name: string;
  absolutePath: string;
  version: string;
  metadata?: PackageMetadata | null;
  source?: SizeInfo;
  output?: SizeInfo;
}

export interface ReportModuleDependency {
  absolutePath: string;
  name: string;
}

export interface ReportModule {
  path: string;
  source: CodeInfo;
  output: CodeInfo;
  dependencies: ReportModuleDependency[];
}

export interface TransformOptions {
  customTransformOptions?: Record<string, unknown>;
  dev: boolean;
  minify: boolean;
  platform: string;
  type?: string;
  unstable_transformProfile?: string;
  [key: string]: unknown;
}

export interface BundleReport {
  kind?: string;
  date: number;
  entryPoint: string;
  rootFolder: string;
  transformOptions: TransformOptions;
  envs?: Record<string, string | undefined>;
  packages: ReportPackage[];
  modules: ReportModule[];
}
