import { themeConfig } from "./theme";

export const siteConfig = {
  name: "FundIt",
  description:
    "Discover ideas. Back what you believe in. Big ideas don't always need big money.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  logo: {
    text: "FundIt",
    /** Path to logo image — set when client provides branding assets */
    src: null as string | null,
    alt: "FundIt logo",
  },
  favicon: "/favicon.ico",
  theme: themeConfig,
  features: {
    auth: true,
    investments: true,
    adminPortal: true,
    investorPortal: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
