import { describe, expect, it } from "vitest";
import { countdown, daysUntil, weekStart, zonedDate, zonedTime, zonedToUtc } from "./time";
import { weekBuckets } from "./workload";

describe("zonedToUtc", () => {
  it("handles winter time (UTC+1)", () => expect(zonedToUtc("2026-12-18T17:00").toISOString()).toBe("2026-12-18T16:00:00.000Z"));
  it("handles summer time (UTC+2)", () => expect(zonedToUtc("2027-06-10T09:30").toISOString()).toBe("2027-06-10T07:30:00.000Z"));
  it("handles the day DST starts", () => expect(zonedToUtc("2027-03-28T12:00").toISOString()).toBe("2027-03-28T10:00:00.000Z"));
  it("handles other zones", () => expect(zonedToUtc("2027-01-15T23:59", "America/New_York").toISOString()).toBe("2027-01-16T04:59:00.000Z"));
  it("accepts date only", () => expect(zonedToUtc("2027-01-17").toISOString()).toBe("2027-01-16T23:00:00.000Z"));
  it("rejects junk", () => expect(() => zonedToUtc("tomorrow")).toThrow());
});

describe("edit form round trip", () => {
  it("shows a stored instant as the same Zurich date and time it was entered with", () => {
    const stored = zonedToUtc("2027-06-10T09:30");
    expect(zonedDate(stored)).toBe("2027-06-10");
    expect(zonedTime(stored)).toBe("09:30");
    expect(zonedTime(zonedToUtc("2026-12-18T00:05"))).toBe("00:05");
  });
});

describe("weeks and countdowns", () => {
  const now = new Date("2026-11-15T10:13:00Z"); // Sunday in Zurich
  it("week starts on Monday", () => expect(weekStart(now)).toBe("2026-11-09"));
  it("late-night Zurich time belongs to the Zurich day", () => expect(weekStart(new Date("2026-11-15T23:30:00Z"))).toBe("2026-11-16"));
  it("counts calendar days in Zurich", () => {
    expect(daysUntil(new Date("2026-11-15T22:00:00Z"), now)).toBe(0);
    expect(daysUntil(new Date("2026-11-15T23:30:00Z"), now)).toBe(1);
    expect(daysUntil(new Date("2026-11-10T08:00:00Z"), now)).toBe(-5);
  });
  it("words countdowns", () => {
    expect(countdown(0)).toBe("today");
    expect(countdown(3)).toBe("in 3 days");
    expect(countdown(-1)).toBe("1 day overdue");
  });
  it("buckets open hours by week and skips done items", () => {
    const b = weekBuckets(
      [
        { due_at: "2026-11-20T16:00:00Z", est_hours: 6, status: "todo" },
        { due_at: "2026-11-18T09:00:00Z", est_hours: 4, status: "done" },
        { due_at: "2026-11-25T09:00:00Z", est_hours: null, status: "todo" },
        { due_at: "2027-08-01T09:00:00Z", est_hours: 9, status: "todo" },
      ],
      now, 4,
    );
    expect(b.map((x) => [x.week, x.hours, x.count])).toEqual([
      ["2026-11-09", 0, 0], ["2026-11-16", 6, 1], ["2026-11-23", 0, 1], ["2026-11-30", 0, 0],
    ]);
  });
});
