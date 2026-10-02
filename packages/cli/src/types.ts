import type {
  BundleReport,
  ReportPackage,
} from "@react-native-bundle-discovery/shared";

/** Package entry after `prepareReport()` added the relative path and own size */
export interface PreparedPackage extends ReportPackage {
  path: string;
  sizeInBytes: number;
}

/** Report returned by `readBuildReport()` / `prepareReport()` */
export interface PreparedReport extends Omit<BundleReport, "packages"> {
  packages: PreparedPackage[];
  kind?: string;
}

export interface Finding {
  message: string;
  packages?: string[] | string;
  docsUrl?: string | string[] | null;
}

export interface Recommendation {
  id: string;
  title: string;
  check(report: PreparedReport): Finding | Finding[] | null;
}

export type SortOrder = "size" | "name";

export interface ByteLimit {
  bytes: number;
  percent?: undefined;
}

export interface PercentLimit {
  percent: number;
  bytes?: undefined;
}

export type SizeLimit = ByteLimit | PercentLimit;
