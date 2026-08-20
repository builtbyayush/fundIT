import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { siteConfig, themeConfig } from "@/config";
import { generateThemeCssVariables } from "@/lib/utils";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const themeVariables = generateThemeCssVariables(themeConfig);

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Discover ideas. Back what you believe in.`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Discover ideas. Back what you believe in.`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Discover ideas. Back what you believe in.`,
    description: siteConfig.description,
  },
  icons: {
    icon: siteConfig.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={themeVariables as React.CSSProperties}>
      <body className={`${plusJakarta.variable} font-sans`}>{children}</body>
    </html>
  );
}
