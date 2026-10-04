import type { App } from "@discoveryjs/discovery";

declare global {
  // Discovery.js app instance, provided as a global at runtime
  const discovery: App;

  // View config types (not exported from the `@discoveryjs/discovery` entry)
  type DiscoveryRawViewConfig = Parameters<App["view"]["render"]>[1];
  type DiscoveryViewConfig = Extract<DiscoveryRawViewConfig, { view: unknown }>;
}
