import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RecordForm } from "@/components/edit-form";
import { Spot } from "@/components/illustrations";
import { RemoveButton } from "@/components/remove-button";
import { Skeleton } from "@/components/skeleton";
import { GOAL_AREAS, RECORDS } from "@/lib/records";
import { requireUser } from "@/lib/supabase/server";
import { fmtDay } from "@/lib/time";

export const metadata: Metadata = { title: "Goals and wins" };
const AREA: Record<string, string> = Object.fromEntries(GOAL_AREAS);
type Goal = { id: string; title: string; area: string; target_date: string | null; progress: number; status: string; notes: string | null };
type Win = { id: string; title: string; happened_on: string | null; story: string | null; result: string | null; skills: string | null };
const edit = "text-xs text-accent-ink underline-offset-2 hover:underline";

async function Growth() {
  const { supabase } = await requireUser();
  const [{ data: g }, { data: a }] = await Promise.all([
    supabase.from("goals").select(RECORDS.goal.cols).is("deleted_at", null).order("target_date", { nullsFirst: false }),
    supabase.from("achievements").select(RECORDS.achievement.cols).is("deleted_at", null).order("happened_on", { ascending: false, nullsFirst: false }),
  ]);
  const goals = (g ?? []) as unknown as Goal[];
  const wins = (a ?? []) as unknown as Win[];
  const active = goals.filter((x) => x.status === "active");
  const closed = goals.filter((x) => x.status !== "active");
  const GoalRow = ({ x }: { x: Goal }) => (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className={`text-sm font-medium ${x.status !== "active" ? "text-muted" : ""}`}>{x.title}</p>
        <p className="mt-0.5 text-xs text-muted">{[AREA[x.area], x.target_date ? `by ${fmtDay(x.target_date)} ${x.target_date.slice(0, 4)}` : null, x.status !== "active" ? x.status : null].filter(Boolean).join(" · ")}</p>
        {x.notes && <p className="mt-1 line-clamp-2 text-xs text-muted">{x.notes}</p>}
      </div>
      <div className="flex w-40 items-center gap-2">
        <progress value={x.progress} max={100} aria-label={`Progress on ${x.title}`} className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-[var(--t-mint)] [&::-webkit-progress-value]:bg-accent" />
        <span className="num w-10 text-right text-xs">{x.progress}%</span>
      </div>
      <Link href={`/edit/goal/${x.id}`} aria-label={`Edit ${x.title}`} className={edit}>Edit</Link>
      <RemoveButton table="goals" id={x.id} label={x.title} />
    </li>
  );

  return (
    <>
      <Spot name="steps" className="float-right -mt-2 ml-4 size-20 sm:size-24" />
      <p className="kicker">Growth</p>
      <h1 className="mt-1 font-serif text-4xl">Goals and wins</h1>

      <section className="mt-6" aria-labelledby="h-goals">
        <h2 id="h-goals" className="eyebrow">Active goals</h2>
        <div className="card mt-2">
          {active.length > 0 ? <ul className="divide-y divide-line">{active.map((x) => <GoalRow key={x.id} x={x} />)}</ul> : <p className="p-6 text-sm text-muted">No active goals yet. Add the two or three that matter most this semester.</p>}
          <details className="border-t border-line" open={goals.length === 0}>
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-accent-ink">Add a goal</summary>
            <RecordForm kind="goal" fields={RECORDS.goal.fields()} submit="Add goal" />
          </details>
        </div>
        {closed.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-muted">Done and dropped ({closed.length})</summary>
            <ul className="card mt-2 divide-y divide-line">{closed.map((x) => <GoalRow key={x.id} x={x} />)}</ul>
          </details>
        )}
      </section>

      <section className="mt-8" aria-labelledby="h-wins">
        <h2 id="h-wins" className="eyebrow">Achievements log</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">Write wins down while they are fresh. The co-pilot draws on these when you ask it for application or interview material.</p>
        <div className="card mt-2">
          {wins.length > 0 && (
            <ul className="divide-y divide-line">
              {wins.map((w) => (
                <li key={w.id} className="flex items-start gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{w.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{[w.happened_on ? `${fmtDay(w.happened_on)} ${w.happened_on.slice(0, 4)}` : null, w.skills].filter(Boolean).join(" · ")}</p>
                    {w.result && <p className="mt-1 text-sm">{w.result}</p>}
                    {w.story && <p className="mt-1 line-clamp-3 text-xs text-muted">{w.story}</p>}
                  </div>
                  <Link href={`/edit/achievement/${w.id}`} aria-label={`Edit ${w.title}`} className={edit}>Edit</Link>
                  <RemoveButton table="achievements" id={w.id} label={w.title} />
                </li>
              ))}
            </ul>
          )}
          <details className={wins.length ? "border-t border-line" : ""} open={wins.length === 0}>
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-accent-ink">Add an achievement</summary>
            <RecordForm kind="achievement" fields={RECORDS.achievement.fields()} submit="Add achievement" />
          </details>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Growth /></Suspense>;
}
