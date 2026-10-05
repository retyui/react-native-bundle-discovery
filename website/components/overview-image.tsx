import overview from "@/public/img/overview.jpg";
import overviewDark from "@/public/img/overview-dark.jpg";
import { ThemedImage } from "./themed-image";

export function OverviewImage({ className = "" }: { className?: string }) {
  return (
    <ThemedImage
      light={overview}
      dark={overviewDark}
      alt="Bundle Discovery UI: Treemap, Insights and Packages tabs"
      className={className}
    />
  );
}
