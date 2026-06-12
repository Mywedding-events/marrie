import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mywedding.events");
const coverImageUrl = new URL("/uploads/whatsapp-cover.jpg", siteUrl).toString();
const previewImage = {
  url: coverImageUrl,
  width: 1200,
  height: 630,
  alt: "Joe and Elissa wedding invitation",
  type: "image/jpeg",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Joe & Elissa - Wedding Invitation",
  description:
    "Wedding invitation for Joe and Elissa on Sunday, August 16, 2026.",
  openGraph: {
    title: "Joe & Elissa - Wedding Invitation",
    description:
      "Wedding invitation for Joe and Elissa on Sunday, August 16, 2026.",
    url: siteUrl,
    siteName: "Joe & Elissa Wedding Invitation",
    type: "website",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joe & Elissa - Wedding Invitation",
    description:
      "Wedding invitation for Joe and Elissa on Sunday, August 16, 2026.",
    images: [previewImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2e5882",
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
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
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
