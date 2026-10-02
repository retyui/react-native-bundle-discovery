// Minimal typings for the parts of `@discoveryjs/cli` used here (the package ships no types)
declare module "@discoveryjs/cli" {
  export function build(
    options: Record<string, unknown>,
    config: Record<string, unknown>,
    configFile: string,
  ): Promise<unknown>;

  // Resolves to an express app
  export function createServer(options: Record<string, unknown>): Promise<{
    listen(port: number | string, callback: () => void): unknown;
  }>;
}

declare module "@discoveryjs/cli/lib/shared/utils.js" {
  export function silent<T>(fn: () => T | Promise<T>): Promise<T>;
}
