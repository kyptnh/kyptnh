import { z } from "zod";
import type { Field } from "@/components/edit-form";

const blank = (v: unknown) => (v === "" || v == null ? null : v);
const text = (max: number) => z.preprocess(blank, z.string().trim().max(max).nullable());
const date = z.preprocess(blank, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.").nullable());
const str = (v: unknown) => (v == null ? "" : String(v));
type Row = Record<string, unknown>;

export const GOAL_AREAS = [["language", "Language"], ["skills", "Skills"], ["publication", "Publication"], ["career", "Career"], ["studies", "Studies"], ["health", "Health and sport"], ["other", "Other"]] as const;
export const GOAL_STATUSES = [["active", "Active"], ["done", "Done"], ["dropped", "Dropped"]] as const;
export const STRENGTHS = [["", "Not set"], ["1", "1 · Just met"], ["2", "2 · Acquaintance"], ["3", "3 · Good contact"], ["4", "4 · Strong"], ["5", "5 · Close ally"]] as const;
export const REFERENCE_STATUSES = [["none", "Not a referee"], ["to_ask", "To ask"], ["asked", "Asked"], ["agreed", "Agreed"], ["submitted", "Reference submitted"]] as const;

/** Simple records that share one add form, one edit form and one save action. */
export const RECORDS = {
  goal: {
    table: "goals", back: "/growth", noun: "goal", cols: "id,title,area,target_date,progress,status,notes",
    schema: z.object({
      title: z.string().trim().min(1, "Give the goal a title.").max(300),
      area: z.enum(["language", "skills", "publication", "career", "studies", "health", "other"]),
      target_date: date,
      progress: z.preprocess((v) => (v === "" || v == null ? 0 : v), z.coerce.number().int().min(0).max(100)),
      status: z.enum(["active", "done", "dropped"]).catch("active"),
      notes: text(5000),
    }),
    fields: (r: Row = {}): Field[] => [
      { name: "title", label: "Goal", value: str(r.title), wide: true, required: true, maxLength: 300 },
      { name: "area", label: "Area", value: str(r.area) || "skills", type: "select", options: GOAL_AREAS },
      { name: "target_date", label: "Target date", value: str(r.target_date), type: "date" },
      { name: "progress", label: "Progress %", value: str(r.progress ?? 0), type: "number", min: 0, max: 100 },
      { name: "status", label: "Status", value: str(r.status) || "active", type: "select", options: GOAL_STATUSES },
      { name: "notes", label: "Notes and next step", value: str(r.notes), type: "textarea", wide: true, maxLength: 5000 },
    ],
  },
  achievement: {
    table: "achievements", back: "/growth", noun: "achievement", cols: "id,title,happened_on,story,result,skills",
    schema: z.object({
      title: z.string().trim().min(1, "Give it a title.").max(300),
      happened_on: date,
      story: text(5000),
      result: text(1000),
      skills: text(300),
    }),
    fields: (r: Row = {}): Field[] => [
      { name: "title", label: "What you did", value: str(r.title), wide: true, required: true, maxLength: 300 },
      { name: "happened_on", label: "When", value: str(r.happened_on), type: "date" },
      { name: "skills", label: "Skills shown (comma-separated)", value: str(r.skills), maxLength: 300 },
      { name: "result", label: "Result, with numbers if you have them", value: str(r.result), wide: true, maxLength: 1000 },
      { name: "story", label: "Situation, task and what you did", value: str(r.story), type: "textarea", wide: true, maxLength: 5000 },
    ],
  },
  contact: {
    table: "contacts", back: "/network", noun: "contact", cols: "id,name,organisation,role,strength,last_contact,follow_up,reference_status,notes",
    schema: z.object({
      name: z.string().trim().min(1, "Add a name.").max(200),
      organisation: text(200),
      role: text(200),
      strength: z.preprocess(blank, z.coerce.number().int().min(1).max(5).nullable()),
      last_contact: date,
      follow_up: date,
      reference_status: z.enum(["none", "to_ask", "asked", "agreed", "submitted"]).catch("none"),
      notes: text(5000),
    }),
    fields: (r: Row = {}): Field[] => [
      { name: "name", label: "Name", value: str(r.name), required: true, maxLength: 200 },
      { name: "organisation", label: "Organisation", value: str(r.organisation), maxLength: 200 },
      { name: "role", label: "Role", value: str(r.role), maxLength: 200 },
      { name: "strength", label: "Relationship", value: str(r.strength), type: "select", options: STRENGTHS },
      { name: "last_contact", label: "Last contact", value: str(r.last_contact), type: "date" },
      { name: "follow_up", label: "Follow up on", value: str(r.follow_up), type: "date" },
      { name: "reference_status", label: "Reference", value: str(r.reference_status) || "none", type: "select", options: REFERENCE_STATUSES },
      { name: "notes", label: "Notes", value: str(r.notes), type: "textarea", wide: true, maxLength: 5000 },
    ],
  },
} as const;
export type RecordKind = keyof typeof RECORDS;
export const isRecordKind = (k: string): k is RecordKind => k in RECORDS;
