export type Criterion = { name: string; weight: number };

/** Weighted result per option as a percentage of the best possible score. Unscored cells count as 0. */
export function decisionTotals(options: string[], criteria: Criterion[], scores: Record<string, number>): number[] {
  const max = criteria.reduce((s, c) => s + c.weight * 5, 0);
  return options.map((_, o) => (max ? Math.round((criteria.reduce((s, c, i) => s + c.weight * (scores[`${i}-${o}`] ?? 0), 0) / max) * 100) : 0));
}
