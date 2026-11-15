import type { Application, Course, Item, Opportunity } from "./types";
import { APP_CLOSED, OPP_CLOSED } from "./types";

export type LayerInfo = { id: string; label: string; color: string; deadline: boolean };
export type Feed = { id: string; name: string; color: string };
export type Entry = { key: string; title: string; detail: string; at: string; allDay: boolean; layer: LayerInfo; href: string; done: boolean };

/** Deadlines get solid, high-contrast colours; everything else is tinted. */
export const ACADEMIC: LayerInfo = { id: "academic", label: "Academic deadlines", color: "var(--d-yellow)", deadline: true };
export const PURSUITS: LayerInfo = { id: "opportunity", label: "Opportunities and career", color: "var(--d-orange)", deadline: true };
export const OTHER: LayerInfo = { id: "personal", label: "Other", color: "var(--c-slate)", deadline: false };
export const feedLayer = (f: Feed): LayerInfo => ({ id: f.id, label: f.name, color: `var(--c-${f.color})`, deadline: false });

/** Opportunities you have decided to pursue. Scan results still sitting in Discovered are left out. */
const PURSUED = ["shortlisted", "preparing", "submitted", "interview", "accepted"];

/** Everything with a date, from every module, as one sorted list. */
export function buildAgenda(items: Item[], courses: Course[], opps: Opportunity[], apps: Application[], feeds: Feed[] = []): Entry[] {
  const course = new Map(courses.map((c) => [c.id, c]));
  const feed = new Map(feeds.map((f) => [f.id, feedLayer(f)]));
  const out: Entry[] = [];
  for (const i of items) {
    if (i.feed_id) {
      const layer = feed.get(i.feed_id);
      if (layer) out.push({ key: `i-${i.id}`, title: i.title, detail: layer.label, at: i.due_at, allDay: i.all_day, layer, href: "/calendar", done: false });
      continue;
    }
    const academic = i.kind === "assessment" || !!i.course_id;
    const c = course.get(i.course_id ?? "");
    out.push({ key: `i-${i.id}`, title: i.title, detail: c ? (c.code ?? c.title) : i.kind, at: i.due_at, allDay: i.all_day, layer: academic ? ACADEMIC : OTHER, href: academic ? "/academics" : "/", done: i.status === "done" });
  }
  for (const o of opps) {
    if (o.deadline_at && PURSUED.includes(o.status)) out.push({ key: `o-${o.id}`, title: o.title, detail: o.organisation ?? "Opportunity deadline", at: o.deadline_at, allDay: true, layer: PURSUITS, href: "/opportunities", done: OPP_CLOSED.includes(o.status) || o.status === "submitted" });
  }
  for (const a of apps) {
    const closed = APP_CLOSED.includes(a.status);
    if (a.deadline_at) out.push({ key: `a-${a.id}`, title: `${a.organisation}: apply`, detail: a.role, at: a.deadline_at, allDay: true, layer: PURSUITS, href: "/career", done: closed || a.status !== "researching" && a.status !== "preparing" });
    if (a.next_step_at && a.next_step) out.push({ key: `n-${a.id}`, title: `${a.organisation}: ${a.next_step}`, detail: a.role, at: a.next_step_at, allDay: true, layer: PURSUITS, href: "/career", done: closed });
  }
  return out.sort((x, y) => x.at.localeCompare(y.at));
}
