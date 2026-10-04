export type {
  PreparedPackage,
  PreparedReport,
  SortOrder,
} from "@react-native-bundle-discovery/shared";

export interface ByteLimit {
  bytes: number;
  percent?: undefined;
}

export interface PercentLimit {
  percent: number;
  bytes?: undefined;
}

export type SizeLimit = ByteLimit | PercentLimit;
