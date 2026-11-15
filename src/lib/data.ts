import "server-only";
import { requireUser } from "./supabase/server";
import { APP_COLS, COURSE_COLS, ITEM_COLS, OPP_COLS, type Application, type Course, type Item, type Opportunity } from "./types";

export async function getCourses(): Promise<Course[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("courses").select(COURSE_COLS).is("deleted_at", null).order("title");
  if (error) throw new Error("Could not load courses");
  return data as Course[];
}

export async function getItems(): Promise<Item[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("items").select(ITEM_COLS).is("deleted_at", null).order("due_at");
  if (error) throw new Error("Could not load items");
  return data as Item[];
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
