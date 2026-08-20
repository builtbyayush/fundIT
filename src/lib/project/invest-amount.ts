import { CURRENCY_MINOR_UNITS, type CurrencyCode } from "@/constants/currency";

/** Step size only — never shown as a participation minimum. */
export function defaultAmountStepMinor(currency: CurrencyCode): number {
  return CURRENCY_MINOR_UNITS[currency] * 100;
}

export function formatMinorAsMajorInput(
  amountMinor: number,
  currency: CurrencyCode,
): string {
  const units = CURRENCY_MINOR_UNITS[currency];
  const whole = Math.trunc(amountMinor / units);
  const frac = Math.abs(amountMinor % units);
  if (frac === 0) return String(whole);
  return `${whole}.${String(frac).padStart(2, "0")}`;
}

export function investmentAmountPresets(input: {
  minimumMinor: number | null;
  maximumMinor: number | null;
  remainingMinor: number | null;
}): number[] {
  const min = input.minimumMinor && input.minimumMinor > 0 ? input.minimumMinor : null;
  const max = input.maximumMinor && input.maximumMinor > 0 ? input.maximumMinor : null;
  const remaining =
    input.remainingMinor != null && input.remainingMinor > 0 ? input.remainingMinor : null;
  const upperCandidates = [max, remaining].filter((value): value is number => value != null);
  const upper = upperCandidates.length ? Math.min(...upperCandidates) : null;

  const values: number[] = [];
  if (min) values.push(min);
  if (min && upper && upper > min) {
    values.push(min + Math.floor((upper - min) / 2));
  }
  if (upper && upper !== min) values.push(upper);

  return [...new Set(values)].sort((a, b) => a - b);
}

export function stepAmountMinor(input: {
  currentMinor: number | null;
  direction: 1 | -1;
  stepMinor: number;
  minimumMinor: number | null;
  maximumMinor: number | null;
  remainingMinor: number | null;
}): number {
  const floor = input.minimumMinor && input.minimumMinor > 0 ? input.minimumMinor : input.stepMinor;
  const ceilingCandidates = [input.maximumMinor, input.remainingMinor].filter(
    (value): value is number => value != null && value > 0,
  );
  const ceiling = ceilingCandidates.length ? Math.min(...ceilingCandidates) : null;
  const current = input.currentMinor && input.currentMinor > 0 ? input.currentMinor : floor;
  let next = current + input.direction * input.stepMinor;
  next = Math.max(next, floor);
  if (ceiling != null) next = Math.min(next, ceiling);
  return next;
}
