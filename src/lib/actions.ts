"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "./supabase/server";
import { TZ, zonedToUtc } from "./time";
import { COLORS } from "./types";
import { isRecordKind, RECORDS } from "./records";

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

const optUrl = z.preprocess(blank, z.url({ protocol: /^https?$/ }).max(2000).optional());
const optDate = z.preprocess(blank, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());
const endOfDay = (d?: string) => (d ? zonedToUtc(`${d}T23:59`, TZ).toISOString() : null);

const oppSchema = z.object({
  title: z.string().trim().min(1, "Give it a title.").max(300),
  organisation: optText(200),
  category: z.enum(["fellowship", "competition", "conference", "think_tank", "volunteering", "research", "accelerator", "leadership", "course", "other"]),
  url: optUrl,
  deadline: optDate,
  fit_score: z.preprocess(blank, z.coerce.number().int().min(0).max(100).optional()),
  strategic_value: z.preprocess(blank, z.coerce.number().int().min(1).max(5).optional()),
  effort_hours: optNum(2000),
  notes: optText(5000),
});

export async function createOpportunity(_: FormState, form: FormData): Promise<FormState> {
  const p = oppSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { ok: false, message: p.error.issues[0].path[0] === "url" ? "The link must start with http:// or https://." : p.error.issues[0].message };
  const { deadline, ...d } = p.data;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("opportunities").insert({
    ...d, organisation: d.organisation ?? null, url: d.url ?? null, deadline_at: endOfDay(deadline),
    fit_score: d.fit_score ?? null, strategic_value: d.strategic_value ?? null, effort_hours: d.effort_hours ?? null, notes: d.notes ?? null,
  });
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: `Added “${d.title}”.` };
}

const appSchema = z.object({
  organisation: z.string().trim().min(1, "Name the organisation.").max(200),
  role: z.string().trim().min(1, "Name the role.").max(300),
  track: z.enum(["private", "diplomacy", "io", "startup", "other"]),
  url: optUrl,
  deadline: optDate,
  next_step: optText(300),
  next_step_date: optDate,
  notes: optText(5000),
});

export async function createApplication(_: FormState, form: FormData): Promise<FormState> {
  const p = appSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { ok: false, message: p.error.issues[0].path[0] === "url" ? "The link must start with http:// or https://." : p.error.issues[0].message };
  const d = p.data;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("applications").insert({
    organisation: d.organisation, role: d.role, track: d.track, url: d.url ?? null, deadline_at: endOfDay(d.deadline),
    next_step: d.next_step ?? null, next_step_at: endOfDay(d.next_step_date), notes: d.notes ?? null,
  });
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: `Added ${d.organisation}.` };
}

const STATUSES = {
  opportunities: ["discovered", "shortlisted", "preparing", "submitted", "interview", "accepted", "rejected", "dropped"],
  applications: ["researching", "preparing", "applied", "interview", "offer", "rejected", "withdrawn"],
} as const;
const table = z.enum(["opportunities", "applications"]);
const removable = z.enum(["opportunities", "applications", "goals", "achievements", "contacts", "decisions"]);

export async function setRecordStatus(form: FormData) {
  const t = table.parse(form.get("table"));
  const status = z.enum(STATUSES[t]).parse(form.get("status"));
  const { supabase } = await requireUser();
  await supabase.from(t).update({ status }).eq("id", id.parse(form.get("id")));
  revalidatePath("/", "layout");
}

export async function removeRecord(form: FormData) {
  const t = removable.parse(form.get("table"));
  const { supabase } = await requireUser();
  await supabase.from(t).update({ deleted_at: new Date().toISOString() }).eq("id", id.parse(form.get("id")));
  revalidatePath("/", "layout");
}

const BACK = { item: "/academics", course: "/academics", opportunity: "/opportunities", application: "/career" } as const;

/** Save edits to one existing record. The form names its kind and id; row-level security limits it to your own rows. */
export async function updateRecord(_: FormState, form: FormData): Promise<FormState> {
  const kind = z.enum(["item", "course", "opportunity", "application"]).safeParse(form.get("_kind"));
  const rowId = id.safeParse(form.get("_id"));
  if (!kind.success || !rowId.success) return { ok: false, message: "This record could not be found." };
  const fields = Object.fromEntries([...form].filter(([k]) => !k.startsWith("_")));
  const bad = (e: z.ZodError) => ({ ok: false, message: e.issues[0].path[0] === "url" ? "The link must start with http:// or https://." : e.issues[0].message });
  let table: "items" | "courses" | "opportunities" | "applications";
  let patch: Record<string, unknown>;

  if (kind.data === "item") {
    const p = itemSchema.safeParse(fields);
    if (!p.success) return bad(p.error);
    const d = p.data;
    table = "items";
    patch = {
      title: d.title, kind: d.kind, assessment_type: d.kind === "assessment" ? (d.assessment_type ?? "assignment") : null,
      course_id: d.course_id ?? null, due_at: zonedToUtc(`${d.date}T${d.time ?? "23:59"}`, TZ).toISOString(), all_day: !d.time,
      est_hours: d.est_hours ?? null, weight_pct: d.kind === "assessment" ? (d.weight_pct ?? null) : null, notes: d.notes ?? null,
    };
  } else if (kind.data === "course") {
    const p = courseSchema.safeParse(fields);
    if (!p.success) return bad(p.error);
    table = "courses";
    patch = { ...p.data, code: p.data.code ?? null, semester: p.data.semester ?? null, ects: p.data.ects ?? null };
  } else if (kind.data === "opportunity") {
    const p = oppSchema.safeParse(fields);
    if (!p.success) return bad(p.error);
    const { deadline, ...d } = p.data;
    table = "opportunities";
    patch = {
      ...d, organisation: d.organisation ?? null, url: d.url ?? null, deadline_at: endOfDay(deadline),
      fit_score: d.fit_score ?? null, strategic_value: d.strategic_value ?? null, effort_hours: d.effort_hours ?? null, notes: d.notes ?? null,
      // Editing a scanned entry means you have checked it.
      verified: true,
    };
  } else {
    const p = appSchema.safeParse(fields);
    if (!p.success) return bad(p.error);
    const d = p.data;
    table = "applications";
    patch = {
      organisation: d.organisation, role: d.role, track: d.track, url: d.url ?? null, deadline_at: endOfDay(d.deadline),
      next_step: d.next_step ?? null, next_step_at: endOfDay(d.next_step_date), notes: d.notes ?? null,
    };
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase.from(table).update(patch).eq("id", rowId.data).select("id");
  if (error || !data?.length) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/", "layout");
  redirect(BACK[kind.data]);
}

/** Add or edit a goal, achievement or contact. With an id it updates and returns to the list; without one it adds. */
export async function saveRecord(_: FormState, form: FormData): Promise<FormState> {
  const kind = String(form.get("_kind") ?? "");
  if (!isRecordKind(kind)) return { ok: false, message: "This record could not be found." };
  const cfg = RECORDS[kind];
  const p = cfg.schema.safeParse(Object.fromEntries([...form].filter(([k]) => !k.startsWith("_"))));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const rowId = id.safeParse(form.get("_id"));
  const { supabase } = await requireUser();
  const row = p.data as Record<string, unknown>;
  const tbl = cfg.table as string;
  if (rowId.success) {
    const { data, error } = await supabase.from(tbl).update(row).eq("id", rowId.data).select("id");
    if (error || !data?.length) return { ok: false, message: "Could not save. Try again." };
    revalidatePath("/", "layout");
    redirect(cfg.back);
  }
  const { error } = await supabase.from(tbl).insert(row);
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: `Added the ${cfg.noun}.` };
}
