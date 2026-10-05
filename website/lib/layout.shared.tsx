import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ExternalLink } from "lucide-react";
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
      {
        text: (
          <span className="inline-flex items-center gap-1">
            Live demo
            <ExternalLink className="size-3.5" />
          </span>
        ),
        url: demoUrl,
        external: true,
        on: "nav",
      },
      { text: "Live demo", url: demoUrl, external: true, on: "menu" },
    ],
    githubUrl,
  };
}
