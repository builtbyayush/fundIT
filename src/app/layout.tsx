import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { siteConfig, themeConfig } from "@/config";
import { generateThemeCssVariables } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const themeVariables = generateThemeCssVariables(themeConfig);

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Discover Investment Opportunities`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Discover Investment Opportunities`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Discover Investment Opportunities`,
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
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
