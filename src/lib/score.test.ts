import { describe, expect, it } from "vitest";
import { priorityScore } from "./score";

describe("priorityScore", () => {
  it("gives full marks to a perfect, urgent, cheap opportunity", () =>
    expect(priorityScore({ fit_score: 100, strategic_value: 5, effort_hours: 1 }, 3).total).toBe(100));
  it("scores missing inputs as zero and flags them", () => {
    const s = priorityScore({ fit_score: null, strategic_value: null, effort_hours: null }, null);
    expect(s.total).toBe(0);
    expect(s.complete).toBe(false);
  });
  it("gives no urgency to past or far deadlines", () => {
    const base = { fit_score: 50, strategic_value: 3, effort_hours: 40 };
    expect(priorityScore(base, -2).total).toBe(38);
    expect(priorityScore(base, 90).total).toBe(38);
    expect(priorityScore(base, 7).total).toBe(58);
  });
  it("ranks higher fit above lower fit, all else equal", () =>
    expect(priorityScore({ fit_score: 80, strategic_value: 4, effort_hours: 10 }, 20).total).toBeGreaterThan(
      priorityScore({ fit_score: 40, strategic_value: 4, effort_hours: 10 }, 20).total));
});
