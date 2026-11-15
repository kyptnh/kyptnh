import { addDays, weekStart } from "./time";

export type WorkItem = { due_at: string; est_hours: number | null; status: string };
export type WeekBucket = { week: string; hours: number; count: number };

/** Open prep hours and item counts per week (Monday-keyed), for `weeks` weeks from now. */
export function weekBuckets(items: WorkItem[], now: Date, weeks = 12): WeekBucket[] {
  const first = weekStart(now);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({ week: addDays(first, i * 7), hours: 0, count: 0 }));
  const index = new Map(buckets.map((b, i) => [b.week, i]));
  for (const it of items) {
    if (it.status === "done") continue;
    const i = index.get(weekStart(new Date(it.due_at)));
    if (i === undefined) continue;
    buckets[i].hours += Number(it.est_hours ?? 0);
    buckets[i].count += 1;
  }
  return buckets;
}
