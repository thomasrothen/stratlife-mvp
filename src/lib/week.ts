// src/lib/week.ts

import type { ISODate } from "@/src/types/focus";

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}` as ISODate;
}

/**
 * Returns Monday (week start) for the given date in LOCAL device time.
 * Monday = start of week.
 */
export function getWeekStartISO(date = new Date()): ISODate {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // JS: Sunday=0, Monday=1 ... Saturday=6
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diffToMonday);

  return toISODate(d);
}

export function getPreviousWeekStartISO(currentWeekStart: ISODate): ISODate {
  const d = new Date(`${currentWeekStart}T00:00:00`);
  d.setDate(d.getDate() - 7);
  return toISODate(d);
}