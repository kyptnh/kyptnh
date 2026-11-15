import "server-only";
import { requireUser } from "./supabase/server";
import { COURSE_COLS, ITEM_COLS, type Course, type Item } from "./types";

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
