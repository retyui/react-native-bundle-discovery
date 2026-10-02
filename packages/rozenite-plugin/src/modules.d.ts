declare module "@discoveryjs/cli" {
  interface DiscoveryServer {
    listen(port: number, callback?: () => void): void;
  }
  export function createServer(
    options: Record<string, unknown>,
  ): Promise<DiscoveryServer>;
}

declare module "react-native-bundle-discovery-ui/dist/discoveryrc.js" {
  const config: Record<string, unknown>;
  export default config;
}
