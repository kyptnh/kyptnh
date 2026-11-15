import type { Application, Course, Item, Opportunity } from "./types";
import { APP_CLOSED, OPP_CLOSED } from "./types";

export type Layer = "academic" | "personal" | "opportunity" | "career" | "imported";
export const LAYERS: { id: Layer; label: string; color: string }[] = [
  { id: "academic", label: "Academic", color: "var(--c-teal)" },
  { id: "opportunity", label: "Opportunities", color: "var(--c-ochre)" },
  { id: "career", label: "Career", color: "var(--c-plum)" },
  { id: "imported", label: "My calendars", color: "var(--c-moss)" },
  { id: "personal", label: "Other", color: "var(--c-slate)" },
];
export type Entry = { key: string; title: string; detail: string; at: string; allDay: boolean; layer: Layer; href: string; done: boolean };

/** Everything with a date, from every module, as one sorted list. */
export function buildAgenda(items: Item[], courses: Course[], opps: Opportunity[], apps: Application[]): Entry[] {
  const course = new Map(courses.map((c) => [c.id, c]));
  const out: Entry[] = [];
  for (const i of items) {
    if (i.feed_id) {
      out.push({ key: `i-${i.id}`, title: i.title, detail: "Imported event", at: i.due_at, allDay: i.all_day, layer: "imported", href: "/calendar", done: false });
      continue;
    }
    const academic = i.kind === "assessment" || !!i.course_id;
    const c = course.get(i.course_id ?? "");
    out.push({ key: `i-${i.id}`, title: i.title, detail: c ? (c.code ?? c.title) : i.kind, at: i.due_at, allDay: i.all_day, layer: academic ? "academic" : "personal", href: academic ? "/academics" : "/", done: i.status === "done" });
  }
  for (const o of opps) {
    if (o.deadline_at) out.push({ key: `o-${o.id}`, title: o.title, detail: o.organisation ?? "Opportunity deadline", at: o.deadline_at, allDay: true, layer: "opportunity", href: "/opportunities", done: OPP_CLOSED.includes(o.status) || o.status === "submitted" });
  }
  for (const a of apps) {
    const closed = APP_CLOSED.includes(a.status);
    if (a.deadline_at) out.push({ key: `a-${a.id}`, title: `${a.organisation}: apply`, detail: a.role, at: a.deadline_at, allDay: true, layer: "career", href: "/career", done: closed || a.status !== "researching" && a.status !== "preparing" });
    if (a.next_step_at && a.next_step) out.push({ key: `n-${a.id}`, title: `${a.organisation}: ${a.next_step}`, detail: a.role, at: a.next_step_at, allDay: true, layer: "career", href: "/career", done: closed });
  }
  return out.sort((x, y) => x.at.localeCompare(y.at));
}
