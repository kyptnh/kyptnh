import Link from "next/link";
import { EntryRow } from "@/components/entry-row";
import { ItemRow } from "@/components/item-row";
import { MissionClock } from "@/components/mission-clock";
import { buildAgenda } from "@/lib/agenda";
import { addDays, daysUntil, fmtDue, TZ, zonedDate } from "@/lib/time";
import { APP_CLOSED, OPP_CLOSED, type Application, type Course, type Item, type Opportunity } from "@/lib/types";
import { weekBuckets } from "@/lib/workload";

const RUNWAY_DAYS = 14;

export function HomeView({ items, courses, opps, apps, now }: { items: Item[]; courses: Course[]; opps: Opportunity[]; apps: Application[]; now: Date }) {
  const byId = new Map(courses.map((c) => [c.id, c]));
  const open = items.filter((i) => i.status !== "done");
  const overdue = open.filter((i) => daysUntil(new Date(i.due_at), now) < 0);
  const soon = open.filter((i) => { const d = daysUntil(new Date(i.due_at), now); return d >= 0 && d <= 14; });
  const pursuits = buildAgenda([], [], opps, apps).filter((e) => !e.done && daysUntil(new Date(e.at), now) <= 30);
  const [thisWeek, nextWeek] = weekBuckets(items, now, 2);

  // Every open deadline still ahead of us, soonest first.
  const ahead = buildAgenda(items, courses, opps, apps).filter((e) => e.layer.deadline && !e.done && Date.parse(e.at) > now.getTime());
  const next = ahead[0];
  const span = RUNWAY_DAYS * 86400000;
  const onRunway = ahead.filter((e) => Date.parse(e.at) - now.getTime() <= span);
  const today = zonedDate(now);
  const ticks = Array.from({ length: RUNWAY_DAYS + 1 }, (_, i) => addDays(today, i));

  const units = [
    { href: "/academics", name: "Academics", value: open.filter((i) => i.kind === "assessment" || i.course_id).length, unit: "open", color: "var(--d-yellow)" },
    { href: "/opportunities", name: "Opportunity Radar", value: opps.filter((o) => o.status === "discovered").length, unit: "to review", color: "var(--d-orange)" },
    { href: "/opportunities", name: "In pursuit", value: opps.filter((o) => !OPP_CLOSED.includes(o.status) && o.status !== "discovered").length, unit: "opportunities", color: "var(--c-teal)" },
    { href: "/career", name: "Career Pipeline", value: apps.filter((a) => !APP_CLOSED.includes(a.status)).length, unit: "active", color: "var(--c-purple)" },
  ];

  return (
    <>
      <section aria-label="Mission board" className="card relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="relative grid gap-8 lg:grid-cols-[auto_1fr] lg:items-end">
          {next ? (
            <MissionClock target={next.at} serverNow={now.toISOString()} title={next.title} detail={fmtDue(new Date(next.at), next.allDay)} color={next.layer.color} href={next.href} />
          ) : (
            <div>
              <p className="text-xs font-medium text-muted">Next deadline</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight">The board is clear</p>
              <p className="mt-2 max-w-sm text-sm text-muted">Add courses in <Link href="/academics" className="text-accent-ink underline underline-offset-2">Academics</Link>, then press Quick add for each assignment and exam.</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted">Runway, next {RUNWAY_DAYS} days</p>
            <div className="relative mt-6 h-12">
              <div aria-hidden className="absolute inset-x-0 top-5 h-px bg-line" />
              {ticks.map((d, i) => (
                <div key={d} aria-hidden className="absolute top-3 flex -translate-x-1/2 flex-col items-center" style={{ left: `${(i / RUNWAY_DAYS) * 100}%` }}>
                  <span className={`w-px ${i % 7 === 0 ? "h-5 bg-muted" : "h-3 bg-line"}`} />
                  {i % 2 === 0 && <span className="num mt-1 text-[10px] text-muted">{Number(d.slice(8))}</span>}
                </div>
              ))}
              <span aria-hidden className="beacon absolute top-[14px] size-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" style={{ left: 0 }} />
              <ul>
                {onRunway.map((e) => (
                  <li key={e.key} className="absolute -top-3 -translate-x-1/2" style={{ left: `${Math.min(100, ((Date.parse(e.at) - now.getTime()) / span) * 100)}%` }}>
                    <Link href={e.href} title={`${e.title} · ${fmtDue(new Date(e.at), e.allDay)}`} className="grid size-6 place-items-center rounded text-xs font-bold text-[#1b1300] ring-2 ring-paper transition-transform hover:scale-125" style={{ background: e.layer.color }}>
                      !<span className="sr-only"> {e.title}, due {fmtDue(new Date(e.at), e.allDay)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-xs text-muted">
              {onRunway.length ? `${onRunway.length} deadline${onRunway.length > 1 ? "s" : ""} on the runway. Yellow is academic, orange is opportunities and career.` : "Nothing due in the next two weeks."}
            </p>
          </div>
        </div>
      </section>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Overdue", overdue.length, overdue.length ? "text-signal" : "text-ink"],
          ["Due in 14 days", soon.length, "text-ink"],
          ["Prep hours, this and next week", thisWeek.hours + nextWeek.hours, "text-ink"],
        ].map(([k, v, cls]) => (
          <div key={String(k)} className="card p-4">
            <dt className="label">{k}</dt>
            <dd className={`num mt-1 text-3xl font-semibold ${cls}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8" aria-labelledby="h-units">
        <h2 id="h-units" className="eyebrow">Your units</h2>
        <ul className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {units.map((u) => (
            <li key={u.name}>
              <Link href={u.href} className="card group block border-l-2 p-4 transition-colors hover:border-accent" style={{ borderLeftColor: u.color }}>
                <p className="text-sm font-medium group-hover:text-accent-ink">{u.name}</p>
                <p className="mt-2"><span className="num text-2xl font-semibold">{u.value}</span> <span className="text-xs text-muted">{u.unit}</span></p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
          <div className="card mt-2 p-6 text-sm text-muted">Nothing due in the next two weeks.</div>
        )}
      </section>

      {pursuits.length > 0 && (
        <section className="mt-8" aria-labelledby="h-other">
          <h2 id="h-other" className="eyebrow">Opportunities and applications, next 30 days</h2>
          <ul className="card mt-2 divide-y divide-line">{pursuits.map((e) => <EntryRow key={e.key} entry={e} now={now} />)}</ul>
        </section>
      )}
      <p className="sr-only">Times shown in {TZ}.</p>
    </>
  );
}

