"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "./actions";
import { isSafeUrl } from "./html";
import { parseIcs } from "./ics-parse";
import { requireUser } from "./supabase/server";
import { TZ } from "./time";

type Client = Awaited<ReturnType<typeof requireUser>>["supabase"];
const DAY = 86400000;

/** Replace one calendar's imported events with a fresh copy: 30 days back, 180 days ahead. */
async function syncFeed(supabase: Client, feed: { id: string; url: string }): Promise<string> {
  let status: string;
  try {
    if (!isSafeUrl(feed.url)) throw new Error("Address not allowed");
    const res = await fetch(feed.url, { headers: { accept: "text/calendar" }, redirect: "follow", signal: AbortSignal.timeout(20000), cache: "no-store" });
    if (!res.ok) throw new Error(`Calendar returned ${res.status}`);
    const text = (await res.text()).slice(0, 8_000_000);
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("That address is not a calendar file");
    const now = Date.now();
    const events = parseIcs(text, new Date(now - 30 * DAY), new Date(now + 180 * DAY));
    const { error: delError } = await supabase.from("items").delete().eq("feed_id", feed.id);
    if (delError) throw new Error("Could not clear old events");
    for (let i = 0; i < events.length; i += 500) {
      const { error } = await supabase.from("items").insert(events.slice(i, i + 500).map((e) => ({
        kind: "event", title: e.title, due_at: e.start.toISOString(), ends_at: e.end?.toISOString() ?? null,
        all_day: e.allDay, tz: TZ, source: "ics", feed_id: feed.id, external_uid: e.uid.slice(0, 500),
      })));
      if (error) throw new Error("Could not save events");
    }
    status = `ok: ${events.length} events`;
  } catch (e) {
    status = `failed: ${e instanceof Error ? e.message.slice(0, 150) : "unknown error"}`;
  }
  await supabase.from("calendar_feeds").update({ last_synced_at: new Date().toISOString(), last_status: status }).eq("id", feed.id);
  return status;
}

export async function addCalendar(_: FormState, form: FormData): Promise<FormState> {
  const p = z.object({ name: z.string().trim().min(1, "Name the calendar.").max(120), url: z.string().trim().max(2000) }).safeParse(Object.fromEntries(form));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const url = p.data.url.replace(/^webcals?:\/\//i, "https://");
  if (!isSafeUrl(url)) return { ok: false, message: "Paste the calendar's public webcal:// or https:// address." };
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("calendar_feeds").insert({ name: p.data.name, url }).select("id,url").single();
  if (error) return { ok: false, message: error.code === "23505" ? "That calendar is already connected." : "Could not save. Try again." };
  const status = await syncFeed(supabase, data);
  revalidatePath("/", "layout");
  return status.startsWith("ok") ? { ok: true, message: `Connected. Imported ${status.slice(4)}.` } : { ok: false, message: `Saved, but the first import ${status}.` };
}

export async function syncCalendars() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("calendar_feeds").select("id,url").limit(10);
  await Promise.all((data ?? []).map((f) => syncFeed(supabase, f)));
  revalidatePath("/", "layout");
}

/** Disconnect a calendar. Its imported events are removed with it; the original calendar is untouched. */
export async function removeCalendar(form: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("calendar_feeds").delete().eq("id", z.uuid().parse(form.get("id")));
  revalidatePath("/", "layout");
}

export async function setCalendarColor(form: FormData) {
  const color = z.enum(["red", "blue", "purple", "moss", "teal", "slate"]).parse(form.get("color"));
  const { supabase } = await requireUser();
  await supabase.from("calendar_feeds").update({ color }).eq("id", z.uuid().parse(form.get("id")));
  revalidatePath("/", "layout");
}
