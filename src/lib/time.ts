export const TZ = "Europe/Zurich";

function offsetMs(utc: Date, tz: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(utc).map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(utc.getTime() / 1000) * 1000;
}

/** "2026-12-18T17:00" wall-clock time in `tz` -> the UTC instant. */
export function zonedToUtc(local: string, tz: string = TZ): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(local);
  if (!m) throw new Error("Invalid date");
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
  const first = guess - offsetMs(new Date(guess), tz);
  return new Date(guess - offsetMs(new Date(first), tz));
}

/** Calendar date (YYYY-MM-DD) of an instant as seen in `tz`. */
export function zonedDate(d: Date, tz: string = TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Monday (YYYY-MM-DD) of the week containing the instant, in `tz`. */
export function weekStart(d: Date, tz: string = TZ): string {
  const [y, m, day] = zonedDate(d, tz).split("-").map(Number);
  const u = new Date(Date.UTC(y, m - 1, day));
  u.setUTCDate(u.getUTCDate() - ((u.getUTCDay() + 6) % 7));
  return u.toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const u = new Date(date + "T00:00:00Z");
  u.setUTCDate(u.getUTCDate() + n);
  return u.toISOString().slice(0, 10);
}

/** Whole calendar days from `now` to `due`, in `tz` (0 = today, negative = overdue). */
export function daysUntil(due: Date, now: Date, tz: string = TZ): number {
  const a = Date.parse(zonedDate(now, tz) + "T00:00:00Z");
  const b = Date.parse(zonedDate(due, tz) + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

export function countdown(days: number): string {
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export function fmtDue(d: Date, allDay: boolean, tz: string = TZ): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, weekday: "short", day: "numeric", month: "short",
    ...(allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
  }).format(d);
}

export function fmtDay(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(date + "T00:00:00Z"));
}

export function fmtMonth(d: Date, tz: string = TZ): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, month: "long", year: "numeric" }).format(d);
}

/** Wall-clock time (HH:MM) of an instant as seen in `tz`. */
export function zonedTime(d: Date, tz: string = TZ): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
}
