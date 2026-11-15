import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseForm } from "@/components/course-form";
import { ItemRow } from "@/components/item-row";
import { Skeleton } from "@/components/skeleton";
import { removeCourse } from "@/lib/actions";
import { getCourses, getItems } from "@/lib/data";
import { fmtDay, fmtMonth } from "@/lib/time";
import type { Item } from "@/lib/types";
import { weekBuckets } from "@/lib/workload";

export const metadata: Metadata = { title: "Academics" };

async function Academics() {
  const [all, courses] = await Promise.all([getItems(), getCourses()]);
  const now = new Date();
  const byId = new Map(courses.map((c) => [c.id, c]));
  const items = all.filter((i) => i.kind === "assessment" || i.course_id);
  const open = items.filter((i) => i.status !== "done");
  const done = items.filter((i) => i.status === "done");
  const weeks = weekBuckets(items, now, 12);
  const peak = Math.max(20, ...weeks.map((w) => w.hours));

  const months = new Map<string, Item[]>();
  for (const i of open) {
    const k = fmtMonth(new Date(i.due_at));
    months.set(k, [...(months.get(k) ?? []), i]);
  }

  return (
    <>
      <p className="kicker">Master&apos;s programme</p>
      <h1 className="mt-1 font-serif text-4xl">Academics</h1>

      <section className="mt-6" aria-labelledby="h-load">
        <h2 id="h-load" className="eyebrow">Workload, next 12 weeks</h2>
        <div className="card mt-2 overflow-x-auto p-4">
          <ol className="grid min-w-[36rem] grid-cols-12 gap-1.5">
            {weeks.map((w) => (
              <li key={w.week} className="text-center">
                <div
                  className="h-12 rounded border border-line"
                  style={{ background: w.hours ? `rgb(var(--heat) / ${0.12 + 0.73 * Math.min(1, w.hours / peak)})` : undefined }}
                />
                <p className="num mt-1.5 text-sm">{w.hours ? `${w.hours} h` : w.count ? "–" : ""}</p>
                <p className="text-[11px] text-muted">{w.count ? `${w.count} due` : " "}</p>
                <p className="num text-[11px] text-muted">{fmtDay(w.week)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted">Open prep hours counted in the week each item is due. Weeks start on Monday.</p>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="h-time">
        <h2 id="h-time" className="eyebrow">Timeline</h2>
        {months.size === 0 && (
          <div className="card mt-2 p-6 text-sm text-muted">No open assessments. Use Quick add to enter assignments, exams and presentations.</div>
        )}
        {[...months].map(([month, list]) => (
          <div key={month} className="mt-3">
            <h3 className="font-serif text-lg">{month}</h3>
            <ul className="card mt-1.5 divide-y divide-line">
              {list.map((i) => <ItemRow key={i.id} item={i} course={byId.get(i.course_id ?? "")} now={now} />)}
            </ul>
          </div>
        ))}
        {done.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted">Completed ({done.length})</summary>
            <ul className="card mt-2 divide-y divide-line">
              {done.map((i) => <ItemRow key={i.id} item={i} course={byId.get(i.course_id ?? "")} now={now} />)}
            </ul>
          </details>
        )}
      </section>

      <section className="mt-8" aria-labelledby="h-courses">
        <h2 id="h-courses" className="eyebrow">Courses</h2>
        <div className="card mt-2">
          {courses.length > 0 && (
            <ul className="divide-y divide-line">
              {courses.map((c) => {
                const n = open.filter((i) => i.course_id === c.id).length;
                return (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span aria-hidden className="size-2.5 rounded-full" style={{ background: `var(--c-${c.color})` }} />
                    <span className="min-w-0 flex-1 truncate font-medium">{c.title}</span>
                    <span className="num text-xs text-muted">{[c.code, c.semester, c.ects != null ? `${Number(c.ects)} ECTS` : null, `${n} open`].filter(Boolean).join(" · ")}</span>
                    <form action={removeCourse}>
                      <input type="hidden" name="id" value={c.id} />
                      <button aria-label={`Remove ${c.title}`} className="grid size-6 place-items-center rounded text-muted hover:text-signal">×</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
          <div className={courses.length ? "border-t border-line" : ""}><CourseForm /></div>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Academics /></Suspense>;
}
