export {
  isEsbuildMetafile,
  isEsbuildMetafilePath,
  transformEsbuildMetafile,
} from "./esbuild";
export { isRsdoctorReport, isRsdoctorReportPath } from "./isRsdoctorReport";
export {
  getDuplicateGroupName,
  getPackageGroups,
  LODASH_FAMILY_GROUP,
  type PackageEntry,
  type PackageGroup,
  type SortOrder,
} from "./packageGroups";
export {
  getPackageModules,
  type PreparedPackage,
  type PreparedReport,
  prepareReport,
  sumModulesSize,
} from "./prepareReport";
export {
  type DeprecatedPackage,
  findDeprecatedPackages,
} from "./recommendations/deprecated-packages";
export {
  collectRecommendations,
  default as recommendations,
  type ReportWithRecommendations,
  withRecommendations,
} from "./recommendations/index";
export type * from "./recommendations/types";
export { transformRSDoctorData } from "./rsdoctor";
export type * from "./types";
export {
  formatRnVersionToDocsFormat,
  getReactNativeVersion,
  isVersionGte,
} from "./versions";
