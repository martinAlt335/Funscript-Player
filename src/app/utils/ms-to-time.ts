export function msToTime(ms: number): string {
  // This will be wrong if timeDiff is greater than a day
  return new Date(ms).toISOString().slice(11, 19);
}
