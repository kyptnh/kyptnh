"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "./actions";
import { requireUser } from "./supabase/server";

const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

export async function createDecision(_: FormState, form: FormData): Promise<FormState> {
  const title = String(form.get("title") ?? "").trim();
  const options = lines(form.get("options")).map((o) => o.slice(0, 80));
  const criteria = lines(form.get("criteria")).map((l) => {
    const m = /^(.*?)(?:[:=]\s*(\d{1,2}))?$/.exec(l)!;
    return { name: m[1].trim().slice(0, 80), weight: Math.min(10, Math.max(1, Number(m[2] ?? 5))) };
  }).filter((c) => c.name);
  if (!title || title.length > 300) return { ok: false, message: "Give the decision a title." };
  if (options.length < 2 || options.length > 6) return { ok: false, message: "List between two and six options, one per line." };
  if (criteria.length < 1 || criteria.length > 12) return { ok: false, message: "List between one and twelve criteria, one per line." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("decisions").insert({ title, options, criteria, scores: {} });
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/decisions");
  return { ok: true, message: "Created. Score each option below." };
}

const scoresSchema = z.record(z.string().regex(/^\d{1,2}-\d{1,2}$/), z.number().min(0).max(5));

/** Scores are keyed "criterion-option" (both zero-based), each from 0 to 5. */
export async function saveScores(_: FormState, form: FormData): Promise<FormState> {
  const id = z.uuid().safeParse(form.get("id"));
  let parsed: unknown;
  try { parsed = JSON.parse(String(form.get("scores") ?? "{}")); } catch { return { ok: false, message: "Could not read the scores." }; }
  const scores = scoresSchema.safeParse(parsed);
  if (!id.success || !scores.success) return { ok: false, message: "Scores must be between 0 and 5." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("decisions").update({ scores: scores.data, notes: String(form.get("notes") ?? "").trim().slice(0, 5000) || null }).eq("id", id.data);
  if (error) return { ok: false, message: "Could not save. Try again." };
  revalidatePath("/decisions");
  return { ok: true, message: "Saved." };
}
