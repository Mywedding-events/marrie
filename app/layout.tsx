import { existsSync } from "node:fs";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  getImageMimeType,
  supportedImageExtensions,
} from "../lib/imageFormats";
import "./globals.css";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "https://mywedding.events";

  return new URL(
    configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`,
  );
}

const siteUrl = getSiteUrl();
const coverImagePath = (() => {
  const extension =
    supportedImageExtensions.find((extension) =>
      existsSync(`${process.cwd()}/public/uploads/1.${extension}`),
    ) ?? "jpg";

  return `/uploads/1.${extension}`;
})();
const coverImageUrl = new URL(coverImagePath, siteUrl).toString();
const previewImage = {
  url: coverImageUrl,
  width: 576,
  height: 1024,
  alt: "Ramy and Mary wedding invitation",
  type: getImageMimeType(coverImagePath),
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Ramy & Mary - Wedding Invitation",
  description:
    "Wedding invitation for Ramy and Mary on Sunday, August 23, 2026.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Ramy & Mary - Wedding Invitation",
    description:
      "Wedding invitation for Ramy and Mary on Sunday, August 23, 2026.",
    url: siteUrl.toString(),
    siteName: "Ramy & Mary Wedding Invitation",
    type: "website",
    locale: "en_US",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramy & Mary - Wedding Invitation",
    description:
      "Wedding invitation for Ramy and Mary on Sunday, August 23, 2026.",
    images: [previewImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b7410e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Gulzar&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Libre+Baskerville:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ visibility: "hidden" }}>
        <noscript>
          <style>{`body{visibility:visible!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
