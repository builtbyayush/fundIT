export function fundingPercentage(committedMinor: number, targetMinor: number): number {
  if (!Number.isInteger(committedMinor) || !Number.isInteger(targetMinor) || targetMinor < 1) {
    return 0;
  }
  return Math.min(Math.floor((committedMinor * 100) / targetMinor), 100);
}
