import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Spot } from "@/components/illustrations";
import { EntryRow } from "@/components/entry-row";
import { Skeleton } from "@/components/skeleton";
import { ACADEMIC, buildAgenda, feedLayer, OTHER, PURSUITS, type Entry } from "@/lib/agenda";
import { getApplications, getCourses, getImportedEvents, getItems, getOpportunities } from "@/lib/data";
import { syncCalendars } from "@/lib/calendars";
import { addDays, weekStart, zonedDate } from "@/lib/time";

export const metadata: Metadata = { title: "Calendar" };
export const maxDuration = 120;

function shiftMonth(m: string, n: number) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1 + n, 1)).toISOString().slice(0, 7);
}

async function Calendar({ searchParams }: { searchParams: Promise<{ m?: string; hide?: string }> }) {
  const sp = await searchParams;
  const [items, courses, opps, apps] = await Promise.all([getItems(), getCourses(), getOpportunities(), getApplications()]);
  const now = new Date();
  const today = zonedDate(now);
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.m ?? "") ? sp.m! : today.slice(0, 7);
  const wanted = (sp.hide ?? "").split(",").filter((x) => /^[a-z0-9-]{1,40}$/.test(x));
  const link = (m: string, hide: Set<string>) => `/calendar?m=${m}${hide.size ? `&hide=${[...hide].join(",")}` : ""}`;

  const first = `${month}-01`;
  const gridStart = weekStart(new Date(first + "T12:00:00Z"), "UTC");
  const days: string[] = [];
  for (let d = gridStart; days.length < 42; d = addDays(d, 1)) {
    if (days.length >= 35 && d.slice(0, 7) !== month) break;
    days.push(d);
  }
  const imported = await getImportedEvents(days[0], days[days.length - 1]);
  const all = buildAgenda([...items, ...imported.events], courses, opps, apps, imported.feeds);
  const layers = [ACADEMIC, PURSUITS, ...imported.feeds.map(feedLayer), ...(all.some((e) => e.layer.id === OTHER.id) ? [OTHER] : [])];
  const hidden = new Set(wanted.filter((x) => layers.some((l) => l.id === x)));
  const entries = all.filter((e) => !hidden.has(e.layer.id));
  const byDay = new Map<string, Entry[]>();
  for (const e of entries) {
    const d = zonedDate(new Date(e.at));
    byDay.set(d, [...(byDay.get(d) ?? []), e]);
  }
  // Deadlines first, so they are never the ones hidden behind "+2".
  for (const list of byDay.values()) list.sort((a, b) => Number(b.layer.deadline) - Number(a.layer.deadline) || a.at.localeCompare(b.at));

  const title = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(first + "T00:00:00Z"));
  const inMonth = entries.filter((e) => e.layer.deadline && zonedDate(new Date(e.at)).startsWith(month)).sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <Spot name="calendar" className="float-right -mt-2 ml-4 size-20 sm:size-24" />
      <p className="kicker">Everything with a date</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">{title}</h1>
        <div className="flex gap-2">
          {imported.feeds.length > 0 && <form action={syncCalendars}><button className="btn h-9 px-3">Sync calendars</button></form>}
          <Link href={link(shiftMonth(month, -1), hidden)} className="btn h-9 px-3" aria-label="Previous month">←</Link>
          <Link href={link(today.slice(0, 7), hidden)} className="btn h-9 px-3">Today</Link>
          <Link href={link(shiftMonth(month, 1), hidden)} className="btn h-9 px-3" aria-label="Next month">→</Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Calendar layers">
        {layers.map((l) => {
          const next = new Set(hidden);
          if (next.has(l.id)) next.delete(l.id); else next.add(l.id);
          const on = !hidden.has(l.id);
          return (
            <Link key={l.id} href={link(month, next)} aria-pressed={on} role="button"
              className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs ${on ? "border-line bg-card" : "border-dashed border-line text-muted line-through"}`}>
              <span aria-hidden className={l.deadline ? "grid size-3.5 place-items-center rounded-sm text-[9px] font-bold text-[#1b1300]" : "size-2 rounded-full"} style={{ background: l.color, opacity: on ? 1 : 0.4 }}>{l.deadline ? "!" : ""}</span>{l.label}
            </Link>
          );
        })}
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="label px-2 py-2 text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const list = byDay.get(d) ?? [];
            const out = d.slice(0, 7) !== month;
            return (
              <div key={d} className={`min-h-16 border-b border-r border-line p-1 [&:nth-child(7n)]:border-r-0 sm:min-h-24 ${out ? "bg-paper/60" : ""}`}>
                <p className={`num mb-1 text-xs ${d === today ? "inline-grid size-6 place-items-center rounded-full bg-accent text-white" : out ? "text-muted/60" : "text-muted"}`}>{Number(d.slice(8))}</p>
                <ul className="space-y-0.5">
                  {list.slice(0, 3).map((e) =>
                    e.layer.deadline ? (
                      <li key={e.key} title={`Deadline: ${e.title}`} className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] font-bold leading-tight text-[#1b1300] ring-1 ring-black/10 ${e.done ? "line-through opacity-60" : ""}`} style={{ background: e.layer.color }}>
                        <span aria-hidden>!</span>
                        <span className="sr-only">Deadline: </span>
                        <span className="hidden truncate sm:inline">{e.title}</span>
                      </li>
                    ) : (
                      <li key={e.key} title={e.title} className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] leading-tight" style={{ background: `color-mix(in srgb, ${e.layer.color} 16%, transparent)` }}>
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: e.layer.color }} />
                        <span className="hidden truncate sm:inline">{e.title}</span>
                      </li>
                    ),
                  )}
                  {list.length > 3 && <li className="text-[11px] text-muted">+{list.length - 3}</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-8" aria-labelledby="h-agenda">
        <h2 id="h-agenda" className="eyebrow">Deadlines in {title}</h2>
        {inMonth.length ? (
          <ul className="card mt-2 divide-y divide-line">{inMonth.map((e) => <EntryRow key={e.key} entry={e} now={now} showOverdue={false} />)}</ul>
        ) : (
          <div className="card mt-2 p-6 text-sm text-muted">No deadlines this month. Academic deadlines appear here in yellow; opportunities you have shortlisted or applied to, and career applications, appear in orange.</div>
        )}
      </section>
    </>
  );
}

export default function Page({ searchParams }: PageProps<"/calendar">) {
  return <Suspense fallback={<Skeleton />}><Calendar searchParams={searchParams} /></Suspense>;
}
