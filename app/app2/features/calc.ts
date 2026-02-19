export function parseTimeToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function grossMinutesWithOvernight(clockIn: string, clockOut: string) {
  const start = parseTimeToMinutes(clockIn);
  const end = parseTimeToMinutes(clockOut);
  
  if (end === start) return 0;
  const adjustedEnd = end <= start ? end + 24 * 60 : end;
  return Math.max(0, adjustedEnd - start);
}

export function workMinutes(clockIn: string, clockOut: string, breakMinutes: number) {
  const gross = grossMinutesWithOvernight(clockIn, clockOut);
  const br = Math.min(Math.max(Math.floor(breakMinutes), 0), gross);
  return Math.max(0, gross - br);
}

export function wageYen(minutes: number, hourlyWage: number) {
  return Math.floor((minutes * hourlyWage) / 60); // 1分単位、円は切り捨て
}

export function fmtHM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function fmtYen(y: number) {
  return `${y.toLocaleString("ja-JP")}円`;
}
