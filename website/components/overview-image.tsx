import Image from "next/image";
import overview from "@/public/img/overview.jpg";
import overviewDark from "@/public/img/overview-dark.jpg";

const alt = "Bundle Discovery UI: Treemap, Insights and Packages tabs";

export function OverviewImage({ className = "" }: { className?: string }) {
  return (
    <>
      <Image
        src={overview}
        alt={alt}
        priority
        className={`dark:hidden ${className}`}
      />
      <Image
        src={overviewDark}
        alt={alt}
        priority
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
