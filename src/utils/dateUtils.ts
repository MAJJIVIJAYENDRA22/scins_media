/**
 * Conference Date Utility
 *
 * Provides robust date parsing and chronological sorting for scientific conferences.
 * Handles standard ISO formats (YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss)
 * as well as DD-MM-YYYY, DD/MM/YYYY, or other textual date representations.
 */

/**
 * Parses any date string format into a numeric Unix timestamp (milliseconds).
 * Returns Infinity if the date is invalid or missing so unscheduled items sort cleanly to the end.
 */
export function parseConferenceDate(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return Infinity;
  const cleaned = dateStr.trim();
  if (!cleaned) return Infinity;

  // Check for DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const dateObj = new Date(year, month, day);
    return isNaN(dateObj.getTime()) ? Infinity : dateObj.getTime();
  }

  // Check for ISO or other standard formats
  const timestamp = new Date(cleaned).getTime();
  return isNaN(timestamp) ? Infinity : timestamp;
}

/**
 * Sorts conferences chronologically by their start date.
 * @param conferences Array of conferences
 * @param direction 'asc' (Earliest first, default) or 'desc' (Latest first)
 */
export function sortConferencesByDate<T extends { start_date?: string }>(
  conferences: T[],
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...conferences].sort((a, b) => {
    const timeA = parseConferenceDate(a.start_date);
    const timeB = parseConferenceDate(b.start_date);
    if (timeA !== timeB) {
      return direction === 'asc' ? timeA - timeB : timeB - timeA;
    }
    return 0;
  });
}

/**
 * Determines whether a conference has completed (date has passed)
 * based automatically on end_date (or start_date).
 */
export function isConferenceCompleted(conf: { start_date?: string; end_date?: string }): boolean {
  const targetDateStr = conf.end_date || conf.start_date;
  const ts = parseConferenceDate(targetDateStr);
  if (ts === Infinity) return false;

  const confDate = new Date(ts);
  // Set to end of that calendar day so current day conferences count as ongoing
  confDate.setHours(23, 59, 59, 999);
  return confDate.getTime() < Date.now();
}

/**
 * Determines whether a conference is ongoing (date is today or in the future).
 */
export function isConferenceOngoing(conf: { start_date?: string; end_date?: string }): boolean {
  return !isConferenceCompleted(conf);
}

