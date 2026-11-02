import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Provider } from "@/components/provider";
import {
  appDescription,
  appName,
  basePath,
  gaMeasurementId,
  siteUrl,
} from "@/lib/shared";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { template: `%s | ${appName}`, default: appName },
  description: appDescription,
  icons: `${basePath}/img/logo.svg`,
  openGraph: {
    images: `${basePath}/img/overview.jpg`,
  },
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
        </Script>
      </body>
    </html>
  );
}
