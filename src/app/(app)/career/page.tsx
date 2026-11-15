import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/record-forms";
import { RemoveButton } from "@/components/remove-button";
import { Skeleton } from "@/components/skeleton";
import { StatusSelect } from "@/components/status-select";
import { getApplications } from "@/lib/data";
import { countdown, daysUntil, fmtDue } from "@/lib/time";
import { APP_CLOSED, APP_STATUSES, APP_TRACKS, type Application } from "@/lib/types";

export const metadata: Metadata = { title: "Career Pipeline" };
const TRACK: Record<string, string> = Object.fromEntries(APP_TRACKS);

function Row({ a, now }: { a: Application; now: Date }) {
  const open = !APP_CLOSED.includes(a.status);
  const when = a.next_step_at ?? (["researching", "preparing"].includes(a.status) ? a.deadline_at : null);
  const days = when ? daysUntil(new Date(when), now) : null;
  const label = `${a.organisation}, ${a.role}`;
  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="truncate text-sm font-medium">
          {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:decoration-ink">{a.organisation}</a> : a.organisation}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">{a.role} · {TRACK[a.track]}</p>
        {a.next_step && open && <p className="mt-1 text-xs">Next: {a.next_step}</p>}
      </div>
      <div className="w-28 text-right">
        {when ? (
          <>
            <p className="num text-sm">{fmtDue(new Date(when), true)}</p>
            {open && <p className={`text-xs ${days! <= 3 ? "font-medium text-signal" : "text-muted"}`}>{countdown(days!)}</p>}
          </>
        ) : <p className="text-xs text-muted">No date set</p>}
      </div>
      <StatusSelect table="applications" id={a.id} status={a.status} options={APP_STATUSES} label={label} />
      <RemoveButton table="applications" id={a.id} label={label} />
    </li>
  );
}

async function Pipeline() {
  const all = await getApplications();
  const now = new Date();
  const closed = all.filter((a) => APP_CLOSED.includes(a.status));
  const count = (s: string) => all.filter((a) => a.status === s).length;

  return (
    <>
      <p className="eyebrow">Internships and jobs</p>
      <h1 className="mt-1 font-serif text-4xl">Career Pipeline</h1>

      <dl className="mt-6 grid grid-cols-4 gap-3">
        {[["Preparing", count("researching") + count("preparing")], ["Applied", count("applied")], ["Interview", count("interview")], ["Offers", count("offer")]].map(([k, v]) => (
          <div key={String(k)} className="card p-4"><dt className="label">{k}</dt><dd className="num mt-1 text-3xl">{v}</dd></div>
        ))}
      </dl>

      {APP_STATUSES.filter(([v]) => !APP_CLOSED.includes(v)).map(([v, label]) => {
        const list = all.filter((a) => a.status === v);
        if (!list.length) return null;
        return (
          <section key={v} className="mt-8" aria-labelledby={`h-${v}`}>
            <h2 id={`h-${v}`} className="eyebrow">{label} <span className="num">({list.length})</span></h2>
            <ul className="card mt-2 divide-y divide-line">{list.map((a) => <Row key={a.id} a={a} now={now} />)}</ul>
          </section>
        );
      })}

      {closed.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted">Closed ({closed.length})</summary>
          <ul className="card mt-2 divide-y divide-line">{closed.map((a) => <Row key={a.id} a={a} now={now} />)}</ul>
        </details>
      )}

      <section className="mt-8" aria-labelledby="h-add">
        <h2 id="h-add" className="eyebrow">Add an application</h2>
        <div className="card mt-2"><ApplicationForm /></div>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Pipeline /></Suspense>;
}
