// Standalone entry that is `require()`d at runtime by the temporary discovery.js
// config generated in `build.ts` / `server.ts` (see `dist/rsdoctor.js`)
import {
  transformEsbuildMetafile,
  transformRSDoctorData,
  withComparison,
  withRecommendations,
} from "@react-native-bundle-discovery/shared";

export {
  transformEsbuildMetafile,
  transformRSDoctorData,
  withComparison,
  withRecommendations,
};

export interface LoadReportOptions {
  path: string;
  /** Apply `transformRSDoctorData()` */
  rsdoctor?: boolean;
  /** Apply `transformEsbuildMetafile()` */
  esbuild?: boolean;
  /** "Before" report path, applies `withComparison()` */
  compare?: string | null;
}

/** Loads a report for the generated discovery.js config and adds recommendations */
export function loadReport({
  path,
  rsdoctor,
  esbuild,
  compare,
}: LoadReportOptions) {
  const data = require(path);
  const report = withRecommendations(
    rsdoctor
      ? transformRSDoctorData(data)
      : esbuild
        ? transformEsbuildMetafile(data, path)
        : data,
  );
  return compare ? withComparison(report, require(compare), compare) : report;
}
