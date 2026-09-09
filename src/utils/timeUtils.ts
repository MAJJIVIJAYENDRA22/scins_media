/**
 * Parses time strings such as '08:00', '09:30', '14:15', '8:00 AM', '5:30 PM' into total minutes from midnight.
 * Returns 9999 for invalid or missing times so unscheduled items sort cleanly to the end.
 */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 9999;
  const cleaned = timeStr.trim().toLowerCase();

  // If time string contains a range or dash (e.g. "09:00 - 10:00" or "09:00–10:00"), extract the start time
  const firstPart = cleaned.split(/[-–—]/)[0].trim();

  // Match HH:MM with optional AM/PM (e.g., "08:00", "8:30 am", "14:45", "02:15pm")
  const match = firstPart.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3]?.toLowerCase();

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Match single hour with AM/PM (e.g., "9 AM", "2pm")
  const hourMatch = firstPart.match(/^(\d{1,2})\s*(am|pm)$/i);
  if (hourMatch) {
    let hours = parseInt(hourMatch[1], 10);
    const meridian = hourMatch[2].toLowerCase();
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    return hours * 60;
  }

  // Pure numeric hour (e.g., "9", "14")
  const numMatch = firstPart.match(/^(\d{1,2})$/);
  if (numMatch) {
    const hours = parseInt(numMatch[1], 10);
    return hours * 60;
  }

  return 9999;
}

/**
 * Sorts items chronologically by `start_time`.
 * - Earlier sessions appear first.
 * - Later sessions appear after them.
 * - If two sessions have the same time, their existing relative order is preserved (stable sort).
 */
export function sortByStartTime<T extends { start_time?: string }>(items: T[]): T[] {
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const timeA = parseTimeToMinutes(a.item.start_time);
      const timeB = parseTimeToMinutes(b.item.start_time);
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}
