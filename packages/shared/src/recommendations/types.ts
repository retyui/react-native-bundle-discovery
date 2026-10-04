import type { PreparedReport } from "../prepareReport";

export type { PreparedReport };

export interface Finding {
  message: string;
  packages?: string[] | string;
  docsUrl?: string | string[] | null;
  /** Estimated bytes saved by applying the recommendation */
  sizeInBytes?: number;
  /** Paths (as in the report) of the modules the finding is about */
  modules?: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  check(report: PreparedReport): Finding | Finding[] | null;
}

export interface RecommendationFinding extends Finding {
  id: string;
  title: string;
}
