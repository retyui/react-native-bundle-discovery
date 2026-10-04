/** Wraps a report expression of the generated discovery.js config with a "before" report diff */
export function withCompare(
  reportExpression: string,
  beforeJsonPath: string | null,
): string {
  return beforeJsonPath
    ? `withComparison(${reportExpression}, require("${beforeJsonPath}"), "${beforeJsonPath}")`
    : reportExpression;
}
