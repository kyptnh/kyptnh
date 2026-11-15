import type { Metadata } from "next";
import { Suspense } from "react";
import { OpportunityForm } from "@/components/record-forms";
import { RemoveButton } from "@/components/remove-button";
import { Skeleton } from "@/components/skeleton";
import { StatusSelect } from "@/components/status-select";
import { getOpportunities } from "@/lib/data";
import { priorityScore } from "@/lib/score";
import { countdown, daysUntil, fmtDue } from "@/lib/time";
import { OPP_CATEGORIES, OPP_CLOSED, OPP_STATUSES, type Opportunity } from "@/lib/types";

export const metadata: Metadata = { title: "Opportunity Radar" };
const CATEGORY: Record<string, string> = Object.fromEntries(OPP_CATEGORIES);

function Card({ o, now }: { o: Opportunity; now: Date }) {
  const days = o.deadline_at ? daysUntil(new Date(o.deadline_at), now) : null;
  const s = priorityScore(o, days);
  const open = !OPP_CLOSED.includes(o.status);
  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="truncate text-sm font-medium">
          {o.url ? <a href={o.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-ink">{o.title}</a> : o.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">{[o.organisation, CATEGORY[o.category]].filter(Boolean).join(" · ")}</p>
        {o.notes && <p className="mt-1 line-clamp-2 text-xs text-muted">{o.notes}</p>}
      </div>
      <div className="w-28 text-right">
        {o.deadline_at ? (
          <>
            <p className="num text-sm">{fmtDue(new Date(o.deadline_at), true)}</p>
            {open && <p className={`text-xs ${days! <= 7 ? "font-medium text-signal" : "text-muted"}`}>{countdown(days!)}</p>}
          </>
        ) : <p className="text-xs text-muted">No deadline set</p>}
      </div>
      <div className="w-24 text-right" title={s.parts.map((p) => `${p.label} ${p.points}/${p.max}`).join(" · ")}>
        <p className="num text-sm">{s.total}<span className="text-muted">/100</span></p>
        <p className="text-[11px] text-muted">{s.complete ? s.parts.map((p) => p.points).join(" + ") : "score incomplete"}</p>
      </div>
      <StatusSelect table="opportunities" id={o.id} status={o.status} options={OPP_STATUSES} label={o.title} />
      <RemoveButton table="opportunities" id={o.id} label={o.title} />
    </li>
  );
}

async function Radar() {
  const all = await getOpportunities();
  const now = new Date();
  const open = all.filter((o) => !OPP_CLOSED.includes(o.status));
  const closed = all.filter((o) => OPP_CLOSED.includes(o.status));
  const score = (o: Opportunity) => priorityScore(o, o.deadline_at ? daysUntil(new Date(o.deadline_at), now) : null).total;
  const bets = open.filter((o) => ["discovered", "shortlisted", "preparing"].includes(o.status)).sort((a, b) => score(b) - score(a)).slice(0, 3);

  return (
    <>
      <p className="eyebrow">Extra-curricular</p>
      <h1 className="mt-1 font-serif text-4xl">Opportunity Radar</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Score = fit (40) + strategic value (30) + urgency (20) + low effort (10). Hover a score for the breakdown.</p>

      {bets.length > 0 && (
        <section className="mt-6" aria-labelledby="h-bets">
          <h2 id="h-bets" className="eyebrow">Best bets right now</h2>
          <ol className="card mt-2 divide-y divide-line">{bets.map((o) => <Card key={o.id} o={o} now={now} />)}</ol>
        </section>
      )}

      {OPP_STATUSES.filter(([v]) => !OPP_CLOSED.includes(v)).map(([v, label]) => {
        const list = open.filter((o) => o.status === v);
        if (!list.length) return null;
        return (
          <section key={v} className="mt-8" aria-labelledby={`h-${v}`}>
            <h2 id={`h-${v}`} className="eyebrow">{label} <span className="num">({list.length})</span></h2>
            <ul className="card mt-2 divide-y divide-line">{list.map((o) => <Card key={o.id} o={o} now={now} />)}</ul>
          </section>
        );
      })}

      {closed.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted">Closed ({closed.length})</summary>
          <ul className="card mt-2 divide-y divide-line">{closed.map((o) => <Card key={o.id} o={o} now={now} />)}</ul>
        </details>
      )}

      <section className="mt-8" aria-labelledby="h-add">
        <h2 id="h-add" className="eyebrow">Add an opportunity</h2>
        <div className="card mt-2"><OpportunityForm /></div>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Radar /></Suspense>;
}
