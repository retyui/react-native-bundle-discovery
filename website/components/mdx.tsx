import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { OverviewImage } from "./overview-image";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    OverviewImage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
