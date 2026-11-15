import { addDays, TZ, zonedDate, zonedTime, zonedToUtc } from "./time";

export type Occurrence = { uid: string; title: string; start: Date; end: Date | null; allDay: boolean };
type Prop = { params: Record<string, string>; value: string };
type RawEvent = Record<string, Prop[]>;
type Local = { date: string; time: string | null; tz: string };

const unescape = (s: string) => s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();

function parseEvents(ics: string): RawEvent[] {
  const lines = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const events: RawEvent[] = [];
  let cur: RawEvent | null = null;
  let nested = 0;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (!cur) continue;
    if (line.startsWith("BEGIN:")) { nested++; continue; }
    if (line.startsWith("END:") && line !== "END:VEVENT") { nested--; continue; }
    if (line === "END:VEVENT") { events.push(cur); cur = null; nested = 0; continue; }
    if (nested) continue; // skip VALARM and other nested blocks
    const m = /^([A-Za-z0-9-]+)((?:;[^:;=]+=(?:"[^"]*"|[^:;]*))*):(.*)$/.exec(line);
    if (!m) continue;
    const params: Record<string, string> = {};
    for (const p of m[2].split(";").filter(Boolean)) {
      const i = p.indexOf("=");
      params[p.slice(0, i).toUpperCase()] = p.slice(i + 1).replace(/^"|"$/g, "");
    }
    (cur[m[1].toUpperCase()] ??= []).push({ params, value: m[3] });
  }
  return events;
}

function validTz(tz: string | undefined): string {
  if (!tz) return TZ;
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); return tz; } catch { return TZ; }
}

/** An iCalendar date or date-time as wall-clock date and time in a zone. */
function toLocal(p: Prop): Local | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(p.value.trim());
  if (!m) return null;
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  if (!m[4]) return { date, time: null, tz: TZ };
  const time = `${m[4]}:${m[5]}`;
  if (m[7]) {
    const utc = new Date(`${date}T${time}:00Z`);
    return { date: zonedDate(utc), time: zonedTime(utc), tz: TZ };
  }
  return { date, time, tz: validTz(p.params.TZID) };
}

const instant = (l: Local, date = l.date) => zonedToUtc(`${date}T${l.time ?? "00:00"}`, l.tz);
const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const weekday = (date: string) => new Date(date + "T00:00:00Z").getUTCDay();

/** Dates (YYYY-MM-DD) on which a repeating event falls, up to `until`. Unsupported rules yield only the first date. */
function recurDates(start: string, rule: string, until: string): string[] {
  const r = Object.fromEntries(rule.split(";").map((kv) => kv.split("=") as [string, string]));
  const interval = Math.max(1, Number(r.INTERVAL ?? 1));
  const count = r.COUNT ? Number(r.COUNT) : Infinity;
  const ruleUntil = r.UNTIL ? `${r.UNTIL.slice(0, 4)}-${r.UNTIL.slice(4, 6)}-${r.UNTIL.slice(6, 8)}` : "9999-12-31";
  const last = ruleUntil < until ? ruleUntil : until;
  const byday = r.BYDAY?.split(",") ?? [];
  if (r.BYMONTHDAY || r.BYSETPOS || r.BYYEARDAY || r.BYWEEKNO || byday.some((d) => !DAYS.includes(d)) || (r.FREQ !== "WEEKLY" && byday.length) || (r.FREQ === "YEARLY" && r.BYMONTH && r.BYMONTH.includes(","))) return [start];
  const out: string[] = [];
  const push = (d: string) => { if (d >= start && d <= last && out.length < count) out.push(d); };
  const [y, m, d] = start.split("-").map(Number);

  for (let i = 0; i < 3000 && out.length < count; i++) {
    if (r.FREQ === "DAILY") {
      const date = addDays(start, i * interval);
      if (date > last) break;
      push(date);
    } else if (r.FREQ === "WEEKLY") {
      const monday = addDays(start, -((weekday(start) + 6) % 7) + i * interval * 7);
      if (monday > last) break;
      const days = (byday.length ? byday.map((x) => DAYS.indexOf(x)) : [weekday(start)]).map((w) => (w + 6) % 7).sort((a, b) => a - b);
      for (const off of days) push(addDays(monday, off));
    } else if (r.FREQ === "MONTHLY" || r.FREQ === "YEARLY") {
      const months = r.FREQ === "MONTHLY" ? i * interval : i * interval * 12;
      const t = new Date(Date.UTC(y, m - 1 + months, d));
      const date = t.toISOString().slice(0, 10);
      if (date.slice(0, 7) > last.slice(0, 7)) break;
      if (t.getUTCDate() === d) push(date); // skip months without that day (e.g. the 31st)
    } else return [start];
  }
  return out;
}

/** Parse an iCalendar file into single occurrences between `from` and `to`, repeating events expanded. */
export function parseIcs(ics: string, from: Date, to: Date, limit = 1500): Occurrence[] {
  const lo = zonedDate(from);
  const hi = zonedDate(to);
  const events = parseEvents(ics);
  const overridden = new Set<string>(); // "uid|date" replaced by a detached instance
  for (const e of events) {
    const rid = e["RECURRENCE-ID"]?.[0];
    const l = rid && toLocal(rid);
    if (l) overridden.add(`${e.UID?.[0]?.value}|${l.date}`);
  }

  const out: Occurrence[] = [];
  for (const e of events) {
    if (e.STATUS?.[0]?.value === "CANCELLED") continue;
    const start = e.DTSTART?.[0] && toLocal(e.DTSTART[0]);
    if (!start) continue;
    const uid = e.UID?.[0]?.value ?? `${e.DTSTART[0].value}-${e.SUMMARY?.[0]?.value ?? ""}`;
    const title = unescape(e.SUMMARY?.[0]?.value ?? "") || "Untitled event";
    const endL = e.DTEND?.[0] && toLocal(e.DTEND[0]);
    const lengthMs = endL ? instant(endL).getTime() - instant(start).getTime() : 0;
    const allDay = start.time === null;
    const isOverride = !!e["RECURRENCE-ID"];
    const exdates = new Set((e.EXDATE ?? []).flatMap((x) => x.value.split(",")).map((v) => toLocal({ params: {}, value: v })?.date));
    const rule = !isOverride && e.RRULE?.[0]?.value;
    const dates = rule ? recurDates(start.date, rule, hi) : [start.date];

    for (const date of dates) {
      if (date < lo || date > hi || exdates.has(date)) continue;
      if (!isOverride && rule && overridden.has(`${uid}|${date}`)) continue;
      const s = instant(start, date);
      // An all-day event's DTEND is the day after it ends, so a one-day event has no separate end.
      const end = lengthMs > (allDay ? 86400000 : 0) ? new Date(s.getTime() + lengthMs) : null;
      out.push({ uid: `${uid}|${date}`, title: title.slice(0, 300), start: s, end, allDay });
      if (out.length >= limit) return out;
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
