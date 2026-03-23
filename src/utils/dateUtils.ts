/**
 * Date utility functions for parsing and formatting
 * library API datetime strings.
 */

/**
 * Parses a datetime string in "yyyyMMddHHmmss" format (e.g., "20260316142740")
 * into a JS Date object. Returns null if parsing fails.
 */
export function parseTimeString(timeStr?: string): Date | null {
  if (!timeStr || timeStr.length < 14) return null;
  const y = parseInt(timeStr.substring(0, 4), 10);
  const mo = parseInt(timeStr.substring(4, 6), 10) - 1; // month is 0-indexed
  const d = parseInt(timeStr.substring(6, 8), 10);
  const h = parseInt(timeStr.substring(8, 10), 10);
  const mi = parseInt(timeStr.substring(10, 12), 10);
  const s = parseInt(timeStr.substring(12, 14), 10);
  const date = new Date(y, mo, d, h, mi, s);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a Date to "HH:MM" string
 */
export function formatHHMM(date: Date | null): string {
  if (!date) return '--:--';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Returns remaining time as "H시간 MM분" or "MM분"
 */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return '종료됨';
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}시간 ${String(m).padStart(2, '0')}분`;
  return `${m}분`;
}

/**
 * Calculates start and end times for seat assignment (adds 6 hours)
 */
export function getSeatAssignmentTimeRange(): { start: string; end: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const startString = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  const end = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const endString = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  
  return { start: startString, end: endString };
}
