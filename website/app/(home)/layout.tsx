import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  const options = baseOptions();
  return (
    <HomeLayout
      {...options}
      links={[
        { text: "Docs", url: "/docs/getting-started/introduction" },
        ...(options.links ?? []),
      ]}
    >
      {children}
    </HomeLayout>
  );
}
