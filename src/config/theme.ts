/**
 * Centralized brand color configuration.
 *
 * Change primary, secondary, and accent here to rebrand the entire application.
 * Values are placeholder colors — not final FundIt branding.
 */
export const themeConfig = {
  /** Main brand / action color */
  primary: "#1e3a5f",
  /** Supporting brand color */
  secondary: "#2d6a4f",
  /** Highlight / emphasis color */
  accent: "#c9a227",

  /** Border radius for UI elements */
  radius: "0.5rem",

  /** Default color mode behavior */
  mode: "system" as "light" | "dark" | "system",
} as const;

export type ThemeConfig = typeof themeConfig;
