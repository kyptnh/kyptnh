import Link from "next/link";
import type { Entry } from "@/lib/agenda";
import { countdown, daysUntil, fmtDue } from "@/lib/time";

/** `showOverdue` off: past entries show their date only (used in the calendar, where "overdue" makes no sense). */
export function EntryRow({ entry, now, showOverdue = true }: { entry: Entry; now: Date; showOverdue?: boolean }) {
  const due = new Date(entry.at);
  const days = daysUntil(due, now);
  const showCount = !entry.done && (days >= 0 || showOverdue);
  return (
    <li>
      <Link href={entry.href} className="flex items-start gap-3 px-4 py-3 hover:bg-paper/60">
        {entry.layer.deadline ? (
          <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded text-[11px] font-bold text-[#1b1300]" style={{ background: entry.layer.color }}>!</span>
        ) : (
          <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: entry.layer.color }} />
        )}
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-medium ${entry.done ? "text-muted line-through" : ""}`}>{entry.title}</span>
          <span className="block truncate text-xs text-muted">{entry.layer.label} · <span className="capitalize">{entry.detail}</span></span>
        </span>
        <span className="shrink-0 text-right">
          <span className="num block text-sm">{fmtDue(due, entry.allDay)}</span>
          {showCount && <span className={`block text-xs ${days <= 3 ? "font-medium text-signal" : "text-muted"}`}>{countdown(days)}</span>}
        </span>
      </Link>
    </li>
  );
}
