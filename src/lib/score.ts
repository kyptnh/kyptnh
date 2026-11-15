export type ScoreInput = { fit_score: number | null; strategic_value: number | null; effort_hours: number | null };
export type Score = { total: number; parts: { label: string; points: number; max: number }[]; complete: boolean };

/**
 * Transparent priority score (0-100) for an opportunity.
 * Fit 40, strategic value 30, urgency 20, effort 10. Missing inputs score 0 and flag the score as incomplete.
 */
export function priorityScore(o: ScoreInput, daysLeft: number | null): Score {
  const fit = o.fit_score == null ? 0 : (o.fit_score / 100) * 40;
  const value = o.strategic_value == null ? 0 : (o.strategic_value / 5) * 30;
  // Urgency: full marks at 7 days or less, fading to zero at 60 days. Past or missing deadlines score 0.
  const urgency = daysLeft == null || daysLeft < 0 ? 0 : daysLeft <= 7 ? 20 : daysLeft >= 60 ? 0 : (20 * (60 - daysLeft)) / 53;
  // Effort: 10 points for 2 hours or less, fading to zero at 40 hours.
  const effort = o.effort_hours == null ? 0 : o.effort_hours <= 2 ? 10 : o.effort_hours >= 40 ? 0 : (10 * (40 - o.effort_hours)) / 38;
  const parts = [
    { label: "Fit", points: Math.round(fit), max: 40 },
    { label: "Value", points: Math.round(value), max: 30 },
    { label: "Urgency", points: Math.round(urgency), max: 20 },
    { label: "Effort", points: Math.round(effort), max: 10 },
  ];
  return { total: parts.reduce((s, p) => s + p.points, 0), parts, complete: o.fit_score != null && o.strategic_value != null && o.effort_hours != null };
}
