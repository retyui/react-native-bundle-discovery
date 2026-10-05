import { createGetUrl } from "fumadocs-core/source";

export const appName = "React Native Bundle Discovery";
export const appDescription =
  "Visualize and analyze the JS bundle of your React Native app";
export const basePath = "/bundle-discovery";
export const siteUrl = "https://retyui.github.io";
export const demoUrl = "https://retyui.github.io/bundle-discovery-demo/";
export const docsRoute = "/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const gitConfig = {
  user: "retyui",
  repo: "react-native-bundle-discovery",
  branch: "main",
};

export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, "content.md"];

  return { segments, url: getContentUrl(segments, page.locale) };
}
