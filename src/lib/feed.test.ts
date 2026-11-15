import { describe, expect, it } from "vitest";
import { htmlToText, isSafeUrl } from "./html";
import { buildIcs } from "./ics";

describe("buildIcs", () => {
  const ics = buildIcs(
    [
      { uid: "item-1", title: "Essay; draft, v2", detail: "Lobbying", at: "2026-12-18T16:00:00Z", all_day: false },
      { uid: "opp-2", title: "Deadline: GIC", detail: null, at: "2027-02-01T22:59:00Z", all_day: true },
    ],
    new Date("2026-11-15T12:00:00Z"),
  );
  it("uses CRLF and wraps the calendar", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("writes timed events in UTC and escapes text", () => {
    expect(ics).toContain("DTSTART:20261218T160000Z");
    expect(ics).toContain("SUMMARY:Essay\\; draft\\, v2");
  });
  it("writes all-day events on the Zurich date", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20270201");
    expect(ics).toContain("DTEND;VALUE=DATE:20270202");
  });
  it("folds long lines", () => {
    const long = buildIcs([{ uid: "x", title: "é".repeat(120), detail: null, at: "2027-01-01T10:00:00Z", all_day: true }], new Date());
    for (const l of long.split("\r\n")) expect(Buffer.byteLength(l)).toBeLessThanOrEqual(75);
  });
});

describe("html helpers", () => {
  it("strips scripts and keeps absolute links", () => {
    const t = htmlToText('<script>alert(1)</script><p>Apply <a href="/jobs/1">here</a> &amp; now</p>', "https://example.org/x");
    expect(t).toBe("Apply here [https://example.org/jobs/1] & now");
  });
  it("only allows public https hosts", () => {
    expect(isSafeUrl("https://www.foraus.ch/mitmachen/")).toBe(true);
    for (const u of ["http://foraus.ch", "https://localhost/x", "https://127.0.0.1/", "https://intranet/", "https://a.internal/", "ftp://x.ch", "https://user@x.ch/"]) expect(isSafeUrl(u)).toBe(false);
  });
});
