import { describe, expect, it } from "vitest";
import { parseIcs } from "./ics-parse";

const wrap = (body: string) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${body.trim().split("\n").join("\r\n")}\r\nEND:VCALENDAR\r\n`;
const from = new Date("2026-11-01T00:00:00Z");
const to = new Date("2027-04-30T00:00:00Z");
const run = (body: string) => parseIcs(wrap(body), from, to).map((o) => [o.title, o.start.toISOString(), o.allDay]);

describe("parseIcs", () => {
  it("reads zoned, UTC and all-day events and unfolds long lines", () => {
    expect(run(`
BEGIN:VEVENT
UID:a
DTSTART;TZID=Europe/Zurich:20261120T140000
DTEND;TZID=Europe/Zurich:20261120T150000
SUMMARY:Seminar\\, room 09-010 and a very long
  title
BEGIN:VALARM
TRIGGER:-PT15M
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:b
DTSTART:20261121T090000Z
SUMMARY:Call
END:VEVENT
BEGIN:VEVENT
UID:c
DTSTART;VALUE=DATE:20270117
DTEND;VALUE=DATE:20270118
SUMMARY:Annual Meeting
END:VEVENT`)).toEqual([
      ["Seminar, room 09-010 and a very long title", "2026-11-20T13:00:00.000Z", false],
      ["Call", "2026-11-21T09:00:00.000Z", false],
      ["Annual Meeting", "2027-01-16T23:00:00.000Z", true],
    ]);
  });

  it("keeps a weekly event at the same local time across the clock change", () => {
    const r = run(`
BEGIN:VEVENT
UID:w
DTSTART;TZID=Europe/Zurich:20270322T101500
RRULE:FREQ=WEEKLY;COUNT=3
SUMMARY:Lecture
END:VEVENT`);
    expect(r.map((x) => x[1])).toEqual(["2027-03-22T09:15:00.000Z", "2027-03-29T08:15:00.000Z", "2027-04-05T08:15:00.000Z"]);
  });

  it("expands BYDAY, respects UNTIL and EXDATE, and applies moved instances", () => {
    const r = run(`
BEGIN:VEVENT
UID:x
DTSTART;TZID=Europe/Zurich:20261116T080000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261126T000000Z
EXDATE;TZID=Europe/Zurich:20261118T080000
SUMMARY:Training
END:VEVENT
BEGIN:VEVENT
UID:x
RECURRENCE-ID;TZID=Europe/Zurich:20261123T080000
DTSTART;TZID=Europe/Zurich:20261123T180000
SUMMARY:Training (moved)
END:VEVENT`);
    expect(r).toEqual([
      ["Training", "2026-11-16T07:00:00.000Z", false],
      ["Training (moved)", "2026-11-23T17:00:00.000Z", false],
      ["Training", "2026-11-25T07:00:00.000Z", false],
    ]);
  });

  it("only keeps occurrences inside the window, skips cancelled events and unknown zones fall back to Zurich", () => {
    const r = run(`
BEGIN:VEVENT
UID:old
DTSTART;VALUE=DATE:20200101
RRULE:FREQ=YEARLY
SUMMARY:New Year
END:VEVENT
BEGIN:VEVENT
UID:gone
DTSTART:20261201T100000Z
STATUS:CANCELLED
SUMMARY:Cancelled
END:VEVENT
BEGIN:VEVENT
UID:odd
DTSTART;TZID=Not/AZone:20261202T120000
SUMMARY:Odd zone
END:VEVENT`);
    expect(r).toEqual([["Odd zone", "2026-12-02T11:00:00.000Z", false], ["New Year", "2026-12-31T23:00:00.000Z", true]]);
  });

  it("does not guess at rules it cannot expand", () => {
    const r = run(`
BEGIN:VEVENT
UID:m
DTSTART;TZID=Europe/Zurich:20261201T090000
RRULE:FREQ=MONTHLY;BYDAY=1TU
SUMMARY:First Tuesday
END:VEVENT`);
    expect(r).toHaveLength(1);
  });
});
