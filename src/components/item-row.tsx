import Link from "next/link";
import { removeItem, setItemStatus } from "@/lib/actions";
import { countdown, daysUntil, fmtDue } from "@/lib/time";
import { ASSESSMENT_TYPES, type Course, type Item } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = Object.fromEntries(ASSESSMENT_TYPES);

export function ItemRow({ item, course, now }: { item: Item; course?: Course; now: Date }) {
  const due = new Date(item.due_at);
  const days = daysUntil(due, now);
  const done = item.status === "done";
  const urgent = !done && days <= 3;
  const label = item.kind === "assessment" ? TYPE_LABEL[item.assessment_type ?? "other"] : item.kind;
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <form action={setItemStatus} className="pt-0.5">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="status" value={done ? "todo" : "done"} />
        <button
          aria-label={done ? `Mark “${item.title}” as not done` : `Mark “${item.title}” as done`}
          className={`grid size-6 place-items-center rounded-full border text-xs ${done ? "border-ok bg-ok text-paper" : "border-muted hover:border-ink"}`}
        >
          {done ? "✓" : ""}
        </button>
      </form>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium sm:truncate ${done ? "text-muted line-through" : ""}`}>{item.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {course && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full" style={{ background: `var(--c-${course.color})` }} />
              {course.code ?? course.title}
            </span>
          )}
          <span className="capitalize">{label}</span>
          {item.weight_pct != null && <span className="num">{Number(item.weight_pct)}%</span>}
          {item.est_hours != null && <span className="num">{Number(item.est_hours)} h</span>}
        </p>
        <p className="mt-0.5 text-xs sm:hidden">
          <span className="num">{fmtDue(due, item.all_day)}</span>
          {!done && <span className={urgent ? " font-medium text-signal" : " text-muted"}> · {countdown(days)}</span>}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="num text-sm">{fmtDue(due, item.all_day)}</p>
        {!done && <p className={`text-xs ${urgent ? "font-medium text-signal" : "text-muted"}`}>{countdown(days)}</p>}
      </div>
      <Link href={`/edit/item/${item.id}`} aria-label={`Edit “${item.title}”`} className="grid h-6 place-items-center rounded px-1 text-xs text-accent-ink underline-offset-2 hover:underline">Edit</Link>
      <form action={removeItem}>
        <input type="hidden" name="id" value={item.id} />
        <button aria-label={`Remove “${item.title}”`} className="grid size-6 place-items-center rounded text-muted hover:text-signal">×</button>
      </form>
    </li>
  );
}
