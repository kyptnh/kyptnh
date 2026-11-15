import type { Metadata } from "next";
import { Suspense } from "react";
import { Spot } from "@/components/illustrations";
import { Skeleton } from "@/components/skeleton";
import { requireUser } from "@/lib/supabase/server";
import { zonedDate } from "@/lib/time";
import { APP_STATUSES, OPP_STATUSES } from "@/lib/types";
import { weekBuckets } from "@/lib/workload";

export const metadata: Metadata = { title: "Insights" };

function Tiles({ items }: { items: [string, string | number, string?][] }) {
  return (
    <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([k, v, note]) => (
        <div key={k} className="card p-4">
          <dt className="label">{k}</dt>
          <dd className="num mt-1 text-2xl">{v}</dd>
          {note && <dd className="mt-1 text-xs text-muted">{note}</dd>}
        </div>
      ))}
    </dl>
  );
}

async function Insights() {
  const { supabase } = await requireUser();
  const [items, opps, apps, goals, contacts, sources] = await Promise.all([
    supabase.from("items").select("due_at,est_hours,status").is("deleted_at", null).is("feed_id", null),
    supabase.from("opportunities").select("status,source,deadline_at").is("deleted_at", null),
    supabase.from("applications").select("status").is("deleted_at", null),
    supabase.from("goals").select("progress,status").is("deleted_at", null),
    supabase.from("contacts").select("follow_up,last_contact").is("deleted_at", null),
    supabase.from("sources").select("last_status"),
  ]);
  const now = new Date();
  const today = zonedDate(now);
  const it = items.data ?? [];
  const op = opps.data ?? [];
  const ap = apps.data ?? [];
  const done = it.filter((i) => i.status === "done").length;
  const overdue = it.filter((i) => i.status !== "done" && i.due_at < now.toISOString()).length;
  const weeks = weekBuckets(it, now, 4);
  const busiest = weeks.reduce((a, b) => (b.hours > a.hours ? b : a), weeks[0]);
  const scanned = op.filter((o) => o.source === "agent");
  const kept = scanned.filter((o) => !["discovered", "dropped", "rejected"].includes(o.status)).length;
  const src = sources.data ?? [];
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "n/a");
  const count = <T extends { status: string }>(rows: T[], s: string) => rows.filter((r) => r.status === s).length;

  return (
    <>
      <Spot name="summit" className="float-right -mt-2 ml-4 size-20 sm:size-24" />
      <p className="kicker">Where your effort goes</p>
      <h1 className="mt-1 font-serif text-4xl">Insights</h1>

      <section className="mt-6" aria-labelledby="h-a">
        <h2 id="h-a" className="eyebrow">Academic work</h2>
        <Tiles items={[
          ["Completed", `${done} of ${it.length}`, pct(done, it.length)],
          ["Overdue", overdue],
          ["Prep hours, next 4 weeks", weeks.reduce((s, w) => s + w.hours, 0)],
          ["Heaviest week", busiest?.hours ? `${busiest.hours} h` : "n/a", busiest?.hours ? `week of ${busiest.week}` : undefined],
        ]} />
      </section>

      <section className="mt-8" aria-labelledby="h-o">
        <h2 id="h-o" className="eyebrow">Opportunities by stage</h2>
        <Tiles items={OPP_STATUSES.map(([v, l]) => [l, count(op, v)])} />
        <p className="mt-2 text-xs text-muted">
          The scan has found {scanned.length} so far; you moved {kept} of them forward ({pct(kept, scanned.length)}). {op.filter((o) => ["shortlisted", "preparing"].includes(o.status) && !o.deadline_at).length} shortlisted or in-progress opportunities have no deadline set.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="h-c">
        <h2 id="h-c" className="eyebrow">Applications by stage</h2>
        <Tiles items={APP_STATUSES.map(([v, l]) => [l, count(ap, v)])} />
        <p className="mt-2 text-xs text-muted">Of {ap.length} applications, {count(ap, "interview") + count(ap, "offer")} reached interview or offer ({pct(count(ap, "interview") + count(ap, "offer"), ap.length)}).</p>
      </section>

      <section className="mt-8" aria-labelledby="h-n">
        <h2 id="h-n" className="eyebrow">Possibly neglected</h2>
        <Tiles items={[
          ["Goals with no progress", (goals.data ?? []).filter((g) => g.status === "active" && g.progress === 0).length],
          ["Follow-ups overdue", (contacts.data ?? []).filter((c) => c.follow_up && c.follow_up < today).length],
          ["Contacts never logged", (contacts.data ?? []).filter((c) => !c.last_contact).length],
          ["Sources failing", src.filter((s) => s.last_status?.startsWith("failed")).length, `of ${src.length}`],
        ]} />
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Insights /></Suspense>;
}
