import Link from "next/link";
import { OverviewImage } from "@/components/overview-image";
import { appName, basePath, demoUrl, githubUrl } from "@/lib/shared";

const features = [
  {
    title: "Interactive UI",
    details:
      'Explore packages, modules and their source/bundled code in the browser, with a treemap and an "Imported by" graph for every module.',
  },
  {
    title: "Optimization recommendations",
    details:
      "Duplicates, deprecated, outdated and dev-only packages and more, ranked by estimated savings.",
  },
  {
    title: "Why is this in my bundle?",
    details: "See the shortest import chain to any package in your bundle.",
  },
  {
    title: "CLI",
    details: "List the heaviest packages and modules right in your terminal.",
  },
  {
    title: "Bundle size checks in CI",
    details:
      "Compare two reports in the UI or in CI and fail on bundle size regressions.",
  },
  {
    title: "Works with your setup",
    details:
      "Metro, Re.Pack (Rspack / Webpack), rnx-kit (esbuild) and React Native DevTools via Rozenite.",
  },
];

const buttonClass =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 md:py-24">
      <div className="flex max-w-3xl flex-col items-center text-center">
        {/* biome-ignore lint/performance/noImgElement: static export */}
        <img
          src={`${basePath}/img/logo.svg`}
          alt=""
          width={88}
          height={88}
          className="mb-8"
        />
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {appName}
        </h1>
        <p className="mt-5 text-lg text-fd-muted-foreground">
          Visualize and analyze the JS bundle of your React Native app. Find
          heavy packages, duplicates and deprecated dependencies, and catch
          bundle size regressions in CI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/getting-started/quick-start"
            className={`${buttonClass} bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90`}
          >
            Quick start
          </Link>
          <a
            href={demoUrl}
            className={`${buttonClass} border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent`}
          >
            Live demo
          </a>
          <a
            href={githubUrl}
            className={`${buttonClass} border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent`}
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="mt-16 w-full max-w-5xl">
        <OverviewImage className="w-full rounded-xl border shadow-lg" />
      </div>

      <div className="mt-16 grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border bg-fd-card p-5 text-fd-card-foreground"
          >
            <h2 className="font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-fd-muted-foreground">
              {feature.details}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
