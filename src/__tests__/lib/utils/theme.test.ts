import { describe, expect, it } from "vitest";

import { themeConfig } from "@/config/theme";
import {
  generateThemeCssVariables,
  getContrastForeground,
  getPastelForeground,
  hexToHslComponents,
  PASTEL_TOKEN_KEYS,
} from "@/lib/utils/theme";

describe("hexToHslComponents", () => {
  it("converts black and white", () => {
    expect(hexToHslComponents("#000000")).toBe("0 0% 0%");
    expect(hexToHslComponents("#ffffff")).toBe("0 0% 100%");
  });

  it("converts the FundIt primary violet", () => {
    expect(hexToHslComponents("#5B4FCF")).toBe("246 57% 56%");
  });
});

describe("getContrastForeground", () => {
  it("returns dark text on light backgrounds", () => {
    expect(getContrastForeground("#FADADD")).toBe("#0f172a");
  });

  it("returns light text on dark backgrounds", () => {
    expect(getContrastForeground("#5B4FCF")).toBe("#f8fafc");
  });
});

describe("getPastelForeground", () => {
  it("always returns a dark readable foreground", () => {
    expect(getPastelForeground("#FADADD")).toBe("#0f172a");
    expect(getPastelForeground("#5B4FCF")).toBe("#0f172a");
  });
});

describe("generateThemeCssVariables", () => {
  const variables = generateThemeCssVariables(themeConfig);

  it("emits brand and radius tokens", () => {
    expect(variables["--primary"]).toBe("246 57% 56%");
    expect(variables["--primary-foreground"]).toBeTruthy();
    expect(variables["--secondary"]).toBeTruthy();
    expect(variables["--accent"]).toBeTruthy();
    expect(variables["--radius"]).toBe("0.75rem");
  });

  it("emits a pastel pair for every palette key", () => {
    for (const key of PASTEL_TOKEN_KEYS) {
      expect(variables[`--pastel-${key}`]).toMatch(/^\d+ \d+% \d+%$/);
      expect(variables[`--pastel-${key}-foreground`]).toBe(
        hexToHslComponents("#0f172a"),
      );
    }
  });
});
