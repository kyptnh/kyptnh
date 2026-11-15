import "server-only";
import type { Feed } from "./agenda";
import { requireUser } from "./supabase/server";
import { zonedToUtc } from "./time";
import { APP_COLS, COURSE_COLS, ITEM_COLS, OPP_COLS, type Application, type Course, type Item, type Opportunity } from "./types";

export async function getCourses(): Promise<Course[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("courses").select(COURSE_COLS).is("deleted_at", null).order("title");
  if (error) throw new Error("Could not load courses");
  return data as Course[];
}

export async function getItems(): Promise<Item[]> {
  const { supabase } = await requireUser();
  // Imported calendar events are loaded separately, per month, so they can never crowd out real deadlines.
  const { data, error } = await supabase.from("items").select(ITEM_COLS).is("deleted_at", null).is("feed_id", null).order("due_at");
  if (error) throw new Error("Could not load items");
  return data as Item[];
}

/** Events copied in from connected calendars, between two dates (YYYY-MM-DD, Zurich), plus whether any calendar is connected. */
export async function getImportedEvents(from: string, to: string): Promise<{ events: Item[]; feeds: Feed[] }> {
  const { supabase } = await requireUser();
  const [{ data, error }, { data: feeds }] = await Promise.all([
    supabase.from("items").select(ITEM_COLS).not("feed_id", "is", null)
      .gte("due_at", zonedToUtc(`${from}T00:00`).toISOString()).lte("due_at", zonedToUtc(`${to}T23:59`).toISOString()).order("due_at").limit(1000),
    supabase.from("calendar_feeds").select("id,name,color").order("name"),
  ]);
  if (error) throw new Error("Could not load calendar events");
  return { events: data as Item[], feeds: (feeds ?? []) as Feed[] };
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("opportunities").select(OPP_COLS).is("deleted_at", null).order("deadline_at", { nullsFirst: false });
  if (error) throw new Error("Could not load opportunities");
  return data as Opportunity[];
}

export async function getApplications(): Promise<Application[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("applications").select(APP_COLS).is("deleted_at", null).order("deadline_at", { nullsFirst: false });
  if (error) throw new Error("Could not load applications");
  return data as Application[];
}
