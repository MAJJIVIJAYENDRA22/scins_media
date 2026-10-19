/**
 * Conference Date Utility
 *
 * Provides robust date parsing and dynamic chronological status-based sorting for scientific conferences.
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

  // Check for YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const dateObj = new Date(year, month, day);
    return isNaN(dateObj.getTime()) ? Infinity : dateObj.getTime();
  }

  // Check for DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
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
 * Extracts start and end of calendar day boundaries for a conference
 */
export function getConferenceDateRange(conf: { start_date?: string; end_date?: string }) {
  const startTs = parseConferenceDate(conf.start_date);
  const endTs = parseConferenceDate(conf.end_date || conf.start_date);

  let startOfDay = startTs;
  if (startTs !== Infinity) {
    const s = new Date(startTs);
    s.setHours(0, 0, 0, 0);
    startOfDay = s.getTime();
  }

  let endOfDay = endTs;
  if (endTs !== Infinity) {
    const e = new Date(endTs);
    e.setHours(23, 59, 59, 999);
    endOfDay = e.getTime();
  }

  return { startOfDay, endOfDay, rawStart: startTs, rawEnd: endTs };
}

export type ConferenceTimelineStatus = 'upcoming' | 'ongoing' | 'completed';

/**
 * Determines whether a conference is Upcoming, Ongoing, or Completed
 * based dynamically on actual conference start/end dates and current date.
 */
export function getConferenceTimelineStatus(
  conf: { start_date?: string; end_date?: string },
  now: number = Date.now()
): ConferenceTimelineStatus {
  const { startOfDay, endOfDay } = getConferenceDateRange(conf);
  if (startOfDay === Infinity && endOfDay === Infinity) {
    return 'upcoming';
  }
  if (now < startOfDay) {
    return 'upcoming';
  }
  if (now > endOfDay) {
    return 'completed';
  }
  return 'ongoing';
}

/**
 * Determines whether a conference is upcoming (start date is in the future).
 */
export function isConferenceUpcoming(
  conf: { start_date?: string; end_date?: string },
  now: number = Date.now()
): boolean {
  return getConferenceTimelineStatus(conf, now) === 'upcoming';
}

/**
 * Determines whether a conference is ongoing (currently in progress today).
 */
export function isConferenceOngoing(
  conf: { start_date?: string; end_date?: string },
  now: number = Date.now()
): boolean {
  return getConferenceTimelineStatus(conf, now) === 'ongoing';
}

/**
 * Determines whether a conference has completed (end date has passed).
 */
export function isConferenceCompleted(
  conf: { start_date?: string; end_date?: string },
  now: number = Date.now()
): boolean {
  return getConferenceTimelineStatus(conf, now) === 'completed';
}

/**
 * Sorts conferences dynamically by date:
 * 1. Upcoming conferences first, ordered by nearest upcoming start date.
 * 2. Followed by Ongoing conferences.
 * 3. Then Completed conferences, ordered by the most recently completed.
 */
export function sortConferencesDynamically<T extends { start_date?: string; end_date?: string }>(
  conferences: T[],
  now: number = Date.now()
): T[] {
  return [...conferences].sort((a, b) => {
    const statusA = getConferenceTimelineStatus(a, now);
    const statusB = getConferenceTimelineStatus(b, now);

    const rank: Record<ConferenceTimelineStatus, number> = {
      upcoming: 1,
      ongoing: 2,
      completed: 3
    };

    if (rank[statusA] !== rank[statusB]) {
      return rank[statusA] - rank[statusB];
    }

    const rangeA = getConferenceDateRange(a);
    const rangeB = getConferenceDateRange(b);

    if (statusA === 'upcoming') {
      // Nearest upcoming start date first
      if (rangeA.rawStart !== rangeB.rawStart) {
        return rangeA.rawStart - rangeB.rawStart;
      }
      return rangeA.rawEnd - rangeB.rawEnd;
    }

    if (statusA === 'ongoing') {
      // Ongoing conferences: ordered by start date (or nearest ending)
      if (rangeA.rawStart !== rangeB.rawStart) {
        return rangeA.rawStart - rangeB.rawStart;
      }
      return rangeA.rawEnd - rangeB.rawEnd;
    }

    // Completed conferences: ordered by most recently completed (latest end date first)
    if (rangeA.rawEnd !== rangeB.rawEnd) {
      return rangeB.rawEnd - rangeA.rawEnd;
    }
    return rangeB.rawStart - rangeA.rawStart;
  });
}

/**
 * Legacy sort helper: sorts conferences chronologically by their start date or dynamically.
 */
export function sortConferencesByDate<T extends { start_date?: string; end_date?: string }>(
  conferences: T[],
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  if (direction === 'asc') {
    return sortConferencesDynamically(conferences);
  }
  return [...conferences].sort((a, b) => {
    const timeA = parseConferenceDate(a.start_date);
    const timeB = parseConferenceDate(b.start_date);
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return 0;
  });
}
