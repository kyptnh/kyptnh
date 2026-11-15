"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "./supabase/server";
import { TZ, zonedToUtc } from "./time";
import { COLORS } from "./types";

export type FormState = { ok: boolean; message: string } | null;

const blank = (v: unknown) => (v === "" || v == null ? undefined : v);
const optNum = (max: number) => z.preprocess(blank, z.coerce.number().min(0).max(max).optional());
const optText = (max: number) => z.preprocess(blank, z.string().trim().max(max).optional());

const itemSchema = z.object({
  title: z.string().trim().min(1, "Give it a title.").max(300),
  kind: z.enum(["assessment", "deadline", "event", "task"]),
  assessment_type: z.preprocess(blank, z.enum(["assignment", "exam", "presentation", "group_work", "paper", "other"]).optional()),
  course_id: z.preprocess(blank, z.uuid().optional()),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  time: z.preprocess(blank, z.string().regex(/^\d{2}:\d{2}$/).optional()),
  est_hours: optNum(2000),
  weight_pct: optNum(100),
  notes: optText(5000),
});

export async function createItem(_: FormState, form: FormData): Promise<FormState> {
  const p = itemSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const d = p.data;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("items").insert({
    title: d.title,
    kind: d.kind,
    assessment_type: d.kind === "assessment" ? (d.assessment_type ?? "assignment") : null,
    course_id: d.course_id ?? null,
    // A deadline with no time means end of that day in Zurich.
    due_at: zonedToUtc(`${d.date}T${d.time ?? "23:59"}`, TZ).toISOString(),
    all_day: !d.time,
    tz: TZ,
    est_hours: d.est_hours ?? null,
    weight_pct: d.kind === "assessment" ? (d.weight_pct ?? null) : null,
    notes: d.notes ?? null,
  });
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: `Added “${d.title}”.` };
}

const courseSchema = z.object({
  title: z.string().trim().min(1, "Give the course a title.").max(200),
  code: optText(40),
  semester: optText(40),
  ects: optNum(60),
  color: z.enum(COLORS).catch("slate"),
});

export async function createCourse(_: FormState, form: FormData): Promise<FormState> {
  const p = courseSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("courses").insert({ ...p.data, code: p.data.code ?? null, semester: p.data.semester ?? null, ects: p.data.ects ?? null });
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: `Added ${p.data.title}.` };
}

const id = z.uuid();

export async function setItemStatus(form: FormData) {
  const itemId = id.parse(form.get("id"));
  const status = z.enum(["todo", "in_progress", "done"]).parse(form.get("status"));
  const { supabase } = await requireUser();
  await supabase.from("items").update({ status }).eq("id", itemId);
  revalidatePath("/", "layout");
}

/** Soft delete: the row stays in the database and can be restored. */
export async function removeItem(form: FormData) {
  const itemId = id.parse(form.get("id"));
  const { supabase } = await requireUser();
  await supabase.from("items").update({ deleted_at: new Date().toISOString() }).eq("id", itemId);
  revalidatePath("/", "layout");
}

export async function removeCourse(form: FormData) {
  const courseId = id.parse(form.get("id"));
  const { supabase } = await requireUser();
  await supabase.from("courses").update({ deleted_at: new Date().toISOString() }).eq("id", courseId);
  revalidatePath("/", "layout");
}
