import { describe, expect, it } from "vitest";
import { decisionTotals } from "./decision-math";

describe("decisionTotals", () => {
  const criteria = [{ name: "Career value", weight: 10 }, { name: "Cost", weight: 5 }];
  it("weights criteria and reports a percentage of the maximum", () => {
    expect(decisionTotals(["A", "B"], criteria, { "0-0": 5, "1-0": 5, "0-1": 5, "1-1": 0 })).toEqual([100, 67]);
  });
  it("treats unscored cells as zero and survives empty criteria", () => {
    expect(decisionTotals(["A", "B"], criteria, { "0-0": 3 })).toEqual([40, 0]);
    expect(decisionTotals(["A"], [], {})).toEqual([0]);
  });
});
