import Link from "next/link";
import { LAYERS, type Entry } from "@/lib/agenda";
import { countdown, daysUntil, fmtDue } from "@/lib/time";

export function EntryRow({ entry, now }: { entry: Entry; now: Date }) {
  const due = new Date(entry.at);
  const days = daysUntil(due, now);
  const layer = LAYERS.find((l) => l.id === entry.layer)!;
  return (
    <li>
      <Link href={entry.href} className="flex items-start gap-3 px-4 py-3 hover:bg-paper/60">
        <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: layer.color }} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-medium ${entry.done ? "text-muted line-through" : ""}`}>{entry.title}</span>
          <span className="block truncate text-xs capitalize text-muted">{layer.label} · {entry.detail}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="num block text-sm">{fmtDue(due, entry.allDay)}</span>
          {!entry.done && <span className={`block text-xs ${days <= 3 ? "font-medium text-signal" : "text-muted"}`}>{countdown(days)}</span>}
        </span>
      </Link>
    </li>
  );
}
