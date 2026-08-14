/**
 * Supported currencies for FundIt investments.
 * Additional currencies can be added later without changing money arithmetic.
 */
export const CurrencyCode = {
  INR: "INR",
} as const;

export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode];

export const SUPPORTED_CURRENCIES = Object.values(CurrencyCode);

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && SUPPORTED_CURRENCIES.includes(value as CurrencyCode);
}

/** Default platform currency until multi-currency is enabled. */
export const DEFAULT_CURRENCY: CurrencyCode = CurrencyCode.INR;

export const CURRENCY_MINOR_UNITS: Record<CurrencyCode, number> = {
  [CurrencyCode.INR]: 100,
};
