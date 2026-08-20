import {
  CURRENCY_MINOR_UNITS,
  CurrencyCode,
  DEFAULT_CURRENCY,
  isCurrencyCode,
} from "@/constants/currency";
import { ApiError } from "@/lib/api/errors";

/**
 * Integer minor-unit money representation.
 * Example: ₹1,500.50 → { amountMinor: 150050, currency: "INR" }
 *
 * Never use floating-point arithmetic for financial calculations.
 */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export function createMoney(
  amountMinor: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): Money {
  assertMoney({ amountMinor, currency });
  return { amountMinor, currency };
}

export function assertMoney(money: Money): void {
  if (!isCurrencyCode(money.currency)) {
    throw new ApiError(400, "Unsupported currency", "INVALID_CURRENCY");
  }
  if (!Number.isInteger(money.amountMinor)) {
    throw new ApiError(400, "Amount must be an integer minor unit", "INVALID_AMOUNT");
  }
  if (money.amountMinor < 0) {
    throw new ApiError(400, "Amount cannot be negative", "INVALID_AMOUNT");
  }
}

export function addMinor(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new ApiError(400, "Money amounts must be integers", "INVALID_AMOUNT");
  }
  return a + b;
}

export function compareMinor(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new ApiError(400, "Money amounts must be integers", "INVALID_AMOUNT");
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function isAtLeast(amountMinor: number, minimumMinor: number): boolean {
  return compareMinor(amountMinor, minimumMinor) >= 0;
}

export function isAtMost(amountMinor: number, maximumMinor: number): boolean {
  return compareMinor(amountMinor, maximumMinor) <= 0;
}

export function sameCurrency(a: CurrencyCode, b: CurrencyCode): boolean {
  return a === b;
}

/**
 * Display formatting only — not for arithmetic.
 */
export function formatMoney(money: Money, locale = "en-IN"): string {
  assertMoney(money);
  const major = money.amountMinor / CURRENCY_MINOR_UNITS[money.currency];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}

function compactNumber(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/**
 * Compact display formatting only (e.g. ₹24.8L). Not for arithmetic.
 */
export function formatMoneyCompact(money: Money, locale = "en-IN"): string {
  assertMoney(money);
  const major = money.amountMinor / CURRENCY_MINOR_UNITS[money.currency];

  if (money.currency === CurrencyCode.INR) {
    if (major >= 10_000_000) {
      return `₹${compactNumber(major / 10_000_000)}Cr`;
    }
    if (major >= 100_000) {
      return `₹${compactNumber(major / 100_000)}L`;
    }
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Parse a major-unit decimal string (e.g. "1500.50") into minor units.
 * Uses string splitting — avoids float rounding for typical 2-decimal currencies.
 */
export function parseMajorToMinor(
  majorInput: string,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): number {
  if (!isCurrencyCode(currency)) {
    throw new ApiError(400, "Unsupported currency", "INVALID_CURRENCY");
  }

  const trimmed = majorInput.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new ApiError(400, "Enter a valid amount (up to 2 decimal places)", "INVALID_AMOUNT");
  }

  const [wholePart, fractionPart = ""] = trimmed.split(".");
  const paddedFraction = fractionPart.padEnd(2, "0").slice(0, 2);
  const minor =
    Number.parseInt(wholePart, 10) * CURRENCY_MINOR_UNITS[currency] +
    Number.parseInt(paddedFraction || "0", 10);

  if (!Number.isInteger(minor) || minor < 0) {
    throw new ApiError(400, "Invalid amount", "INVALID_AMOUNT");
  }

  return minor;
}
