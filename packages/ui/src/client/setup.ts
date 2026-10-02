import prepare from "./prepare";
import queryHelpers from "./queryHelpers";

interface SetupApi {
  defineObjectMarker: unknown;
  addQueryHelpers(helpers: typeof queryHelpers): void;
  setPrepare(fn: typeof prepare): void;
}

export default function setup({ addQueryHelpers, setPrepare }: SetupApi) {
  // extend queries with custom methods
  addQueryHelpers(queryHelpers);
  setPrepare(prepare);
}
