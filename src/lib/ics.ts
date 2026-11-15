import { addDays, zonedDate } from "./time";

export type FeedRow = { uid: string; title: string; detail: string | null; at: string; all_day: boolean };

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Fold lines to 75 octets as RFC 5545 requires. */
function fold(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = Buffer.byteLength(ch);
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function buildIcs(rows: FeedRow[], now: Date): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Career Command Center//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Command Center", "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H"];
  for (const r of rows) {
    const at = new Date(r.at);
    lines.push("BEGIN:VEVENT", `UID:${r.uid}@command-center`, `DTSTAMP:${stamp(now)}`);
    if (r.all_day) {
      const day = zonedDate(at);
      lines.push(`DTSTART;VALUE=DATE:${day.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${addDays(day, 1).replace(/-/g, "")}`);
    } else {
      lines.push(`DTSTART:${stamp(at)}`, `DTEND:${stamp(new Date(at.getTime() + 30 * 60000))}`);
    }
    lines.push(`SUMMARY:${esc(r.title)}`);
    if (r.detail) lines.push(`DESCRIPTION:${esc(r.detail)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
