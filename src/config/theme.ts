/**
 * Centralized brand and pastel palette configuration.
 *
 * Change values here to rebrand the entire application. Components must use
 * semantic tokens (bg-primary, bg-pastel-mint) rather than hardcoded colors.
 *
 * See src/docs/design-system.md for usage rules.
 */
export const themeConfig = {
  /** Main brand / action color — confident CTA, not corporate navy */
  primary: "#5B4FCF",
  /** Supporting brand color */
  secondary: "#2BA89A",
  /** Highlight / emphasis color */
  accent: "#F4A261",

  /**
   * Decorative pastel surfaces. Use for backgrounds, cards, sections, and
   * badges — never for body text or primary CTAs.
   */
  pastels: {
    pink: "#FADADD",
    peach: "#FFE5D0",
    yellow: "#FFF3C4",
    mint: "#D4F5E9",
    blue: "#D6E8FF",
    lavender: "#E8DEFF",
  },

  /** Border radius for UI elements */
  radius: "0.75rem",

  /** Default color mode behavior. Dark mode CSS exists but is not wired up. */
  mode: "system" as "light" | "dark" | "system",
} as const;

export type ThemeConfig = typeof themeConfig;
