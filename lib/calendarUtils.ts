import {
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInMinutes,
  isSameDay,
  setHours,
  setMinutes,
} from "date-fns";

export type CalEvent = { id: string; title: string; start: Date; end: Date; color?: string | null };

/** Week range (Sun–Sat) in local time. */
export function getWeekRange(ref: Date): { start: Date; end: Date } {
  const start = startOfWeek(ref, { weekStartsOn: 0 });
  const end = endOfWeek(ref, { weekStartsOn: 0 });
  return { start, end };
}

/** Total scheduled minutes in a single day. */
export function getScheduledMinutesInDay(events: CalEvent[], day: Date): number {
  return events
    .filter((e) => isSameDay(e.start, day) || isSameDay(e.end, day))
    .reduce((sum, e) => {
      const dayStart = setMinutes(setHours(day, 0), 0);
      const dayEnd = setMinutes(setHours(day, 23), 59);
      const s = e.start < dayStart ? dayStart : e.start;
      const en = e.end > dayEnd ? dayEnd : e.end;
      return sum + Math.max(0, differenceInMinutes(en, s));
    }, 0);
}

/** Total scheduled minutes in the week. */
export function getScheduledMinutesInWeek(
  events: CalEvent[],
  weekStart: Date
): number {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    total += getScheduledMinutesInDay(events, day);
  }
  return total;
}

/** True if any day has > 8h or week has > 40h. */
export function isOverloaded(
  events: CalEvent[],
  ref: Date
): { overloaded: boolean; reason?: string } {
  const { start: weekStart } = getWeekRange(ref);
  const weekMinutes = getScheduledMinutesInWeek(events, weekStart);
  if (weekMinutes > 40 * 60)
    return { overloaded: true, reason: "Your week looks overloaded — consider rescheduling." };

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const dayMinutes = getScheduledMinutesInDay(events, day);
    if (dayMinutes > 8 * 60)
      return { overloaded: true, reason: "Your week looks overloaded — consider rescheduling." };
  }
  return { overloaded: false };
}

export type FreeSlot = { start: Date; end: Date; durationMinutes: number };

const WORK_START = 8;
const WORK_END = 22;

/** Find free slots in the week (gaps between events). Slot lengths: 30, 60, 90 minutes. */
export function findFreeSlots(
  events: CalEvent[],
  ref: Date,
  durationMinutes: 30 | 60 | 90
): FreeSlot[] {
  const { start: weekStart } = getWeekRange(ref);
  const slots: FreeSlot[] = [];

  for (let d = 0; d < 7; d++) {
    const day = addDays(weekStart, d);
    const dayStart = setMinutes(setHours(day, WORK_START), 0);
    const dayEnd = setMinutes(setHours(day, WORK_END), 0);

    const dayEvents = events
      .filter(
        (e) =>
          (e.start >= dayStart && e.start < dayEnd) ||
          (e.end > dayStart && e.end <= dayEnd) ||
          (e.start <= dayStart && e.end >= dayEnd)
      )
      .map((e) => ({
        start: e.start < dayStart ? dayStart : e.start,
        end: e.end > dayEnd ? dayEnd : e.end,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // Merge overlapping
    const merged: { start: Date; end: Date }[] = [];
    for (const ev of dayEvents) {
      if (
        merged.length &&
        ev.start.getTime() <= merged[merged.length - 1].end.getTime()
      ) {
        merged[merged.length - 1].end =
          ev.end > merged[merged.length - 1].end
            ? ev.end
            : merged[merged.length - 1].end;
      } else {
        merged.push({ start: ev.start, end: ev.end });
      }
    }

    let cursor = dayStart.getTime();
    const dayEndT = dayEnd.getTime();

    for (const block of merged) {
      const blockStart = block.start.getTime();
      while (cursor + durationMinutes * 60 * 1000 <= blockStart) {
        slots.push({
          start: new Date(cursor),
          end: new Date(cursor + durationMinutes * 60 * 1000),
          durationMinutes,
        });
        cursor += 30 * 60 * 1000; // step 30 min
      }
      cursor = Math.max(cursor, block.end.getTime());
    }
    while (cursor + durationMinutes * 60 * 1000 <= dayEndT) {
      slots.push({
        start: new Date(cursor),
        end: new Date(cursor + durationMinutes * 60 * 1000),
        durationMinutes,
      });
      cursor += 30 * 60 * 1000;
    }
  }

  return slots;
}

/** Mood level from 0–2 based on number of events today. */
export function getMoodLevel(events: CalEvent[], day: Date): 0 | 1 | 2 {
  const count = events.filter(
    (e) => isSameDay(e.start, day) || isSameDay(e.end, day)
  ).length;
  if (count <= 2) return 0;
  if (count <= 5) return 1;
  return 2;
}
