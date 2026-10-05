import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, basePath, demoUrl, githubUrl } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* biome-ignore lint/performance/noImgElement: static export */}
          <img src={`${basePath}/img/logo.svg`} alt="" width={24} height={24} />
          {appName}
        </>
      ),
    },
    links: [
      { text: "Docs", url: "/docs/getting-started/introduction" },
      { text: "Live demo", url: demoUrl, external: true },
    ],
    githubUrl,
  };
}
