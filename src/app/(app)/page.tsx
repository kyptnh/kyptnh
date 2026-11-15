import { Suspense } from "react";
import Link from "next/link";
import { ItemRow } from "@/components/item-row";
import { Skeleton } from "@/components/skeleton";
import { EntryRow } from "@/components/entry-row";
import { buildAgenda } from "@/lib/agenda";
import { getApplications, getCourses, getItems, getOpportunities } from "@/lib/data";
import { daysUntil, TZ } from "@/lib/time";
import { weekBuckets } from "@/lib/workload";

async function Home() {
  const [items, courses, opps, apps] = await Promise.all([getItems(), getCourses(), getOpportunities(), getApplications()]);
  const now = new Date();
  const byId = new Map(courses.map((c) => [c.id, c]));
  const open = items.filter((i) => i.status !== "done");
  const overdue = open.filter((i) => daysUntil(new Date(i.due_at), now) < 0);
  const soon = open.filter((i) => { const d = daysUntil(new Date(i.due_at), now); return d >= 0 && d <= 14; });
  const other = buildAgenda([], [], opps, apps).filter((e) => { const d = daysUntil(new Date(e.at), now); return !e.done && d <= 30; });
  const [thisWeek, nextWeek] = weekBuckets(items, now, 2);
  const today = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(now);

  return (
    <>
      <p className="eyebrow">{today}</p>
      <h1 className="mt-1 font-serif text-4xl">Command Center</h1>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[
          ["Overdue", overdue.length, overdue.length ? "text-signal" : ""],
          ["Due in 14 days", soon.length, ""],
          ["Prep hours, this + next week", thisWeek.hours + nextWeek.hours, ""],
        ].map(([k, v, cls]) => (
          <div key={String(k)} className="card p-4">
            <dt className="label">{k}</dt>
            <dd className={`num mt-1 text-3xl ${cls}`}>{v}</dd>
          </div>
        ))}
      </dl>

      {overdue.length > 0 && (
        <section className="mt-8" aria-labelledby="h-over">
          <h2 id="h-over" className="eyebrow text-signal">Overdue</h2>
          <ul className="card mt-2 divide-y divide-line">
            {overdue.map((i) => <ItemRow key={i.id} item={i} course={byId.get(i.course_id ?? "")} now={now} />)}
          </ul>
        </section>
      )}

      <section className="mt-8" aria-labelledby="h-soon">
        <h2 id="h-soon" className="eyebrow">Next 14 days</h2>
        {soon.length ? (
          <ul className="card mt-2 divide-y divide-line">
            {soon.map((i) => <ItemRow key={i.id} item={i} course={byId.get(i.course_id ?? "")} now={now} />)}
          </ul>
        ) : (
          <div className="card mt-2 p-6 text-sm text-muted">
            {items.length === 0 && other.length === 0 ? (
              <>Nothing here yet. Add your courses in <Link href="/academics" className="text-ink underline">Academics</Link>, then use Quick add for each assignment and exam.</>
            ) : "Nothing due in the next two weeks."}
          </div>
        )}
      </section>

      {other.length > 0 && (
        <section className="mt-8" aria-labelledby="h-other">
          <h2 id="h-other" className="eyebrow">Opportunities and applications, next 30 days</h2>
          <ul className="card mt-2 divide-y divide-line">{other.map((e) => <EntryRow key={e.key} entry={e} now={now} />)}</ul>
        </section>
      )}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Home /></Suspense>;
}
