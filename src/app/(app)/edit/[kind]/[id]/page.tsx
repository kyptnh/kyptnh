import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditForm, RecordForm, type Field } from "@/components/edit-form";
import { isRecordKind, RECORDS } from "@/lib/records";
import { Skeleton } from "@/components/skeleton";
import { getCourses } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";
import { zonedDate, zonedTime } from "@/lib/time";
import { APP_COLS, APP_TRACKS, ASSESSMENT_TYPES, COLORS, COURSE_COLS, ITEM_COLS, KINDS, OPP_CATEGORIES, OPP_COLS, type Application, type Course, type Item, type Opportunity } from "@/lib/types";

export const metadata: Metadata = { title: "Edit" };

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));
const day = (iso: string | null) => (iso ? zonedDate(new Date(iso)) : "");
const TABLE = { item: ["items", ITEM_COLS, "/academics", "Edit item"], course: ["courses", COURSE_COLS, "/academics", "Edit course"], opportunity: ["opportunities", OPP_COLS, "/opportunities", "Edit opportunity"], application: ["applications", APP_COLS, "/career", "Edit application"] } as const;

async function Edit({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (isRecordKind(kind) && /^[0-9a-f-]{36}$/.test(id)) {
    const cfg = RECORDS[kind];
    const { supabase } = await requireUser();
    const { data } = await supabase.from(cfg.table as string).select(cfg.cols as string).eq("id", id).is("deleted_at", null).maybeSingle();
    if (!data) notFound();
    return (
      <>
        <p className="kicker">Edit</p>
        <h1 className="mt-1 font-serif text-4xl">Edit {cfg.noun}</h1>
        <div className="card mt-6"><RecordForm kind={kind} id={id} fields={cfg.fields(data as unknown as Record<string, unknown>)} back={cfg.back} submit="Save changes" /></div>
      </>
    );
  }
  if (!(kind in TABLE) || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [table, cols, back, title] = TABLE[kind as keyof typeof TABLE];
  const { supabase } = await requireUser();
  const { data } = await supabase.from(table as string).select(cols as string).eq("id", id).is("deleted_at", null).maybeSingle();
  if (!data) notFound();

  let fields: Field[];
  if (kind === "item") {
    const r = data as unknown as Item;
    const courses = await getCourses();
    fields = [
      { name: "title", label: "Title", value: r.title, wide: true, required: true, maxLength: 300 },
      { name: "kind", label: "Kind", value: r.kind, type: "select", options: KINDS },
      { name: "course_id", label: "Course", value: str(r.course_id), type: "select", options: [["", "None"], ...courses.map((c) => [c.id, c.title] as const)] },
      { name: "date", label: "Date", value: day(r.due_at), type: "date", required: true },
      { name: "time", label: "Time (optional)", value: r.all_day ? "" : zonedTime(new Date(r.due_at)), type: "time" },
      { name: "assessment_type", label: "Type (assessments)", value: r.assessment_type ?? "assignment", type: "select", options: ASSESSMENT_TYPES },
      { name: "weight_pct", label: "Weight %", value: str(r.weight_pct), type: "number", min: 0, max: 100 },
      { name: "est_hours", label: "Prep hours", value: str(r.est_hours), type: "number", min: 0 },
      { name: "notes", label: "Notes", value: str(r.notes), type: "textarea", wide: true, maxLength: 5000 },
    ];
  } else if (kind === "course") {
    const r = data as unknown as Course;
    fields = [
      { name: "title", label: "Course title", value: r.title, wide: true, required: true, maxLength: 200 },
      { name: "code", label: "Code", value: str(r.code), maxLength: 40 },
      { name: "semester", label: "Semester", value: str(r.semester), maxLength: 40 },
      { name: "ects", label: "ECTS", value: str(r.ects), type: "number", min: 0, max: 60 },
      { name: "color", label: "Colour", value: r.color, type: "select", options: COLORS.map((c) => [c, c[0].toUpperCase() + c.slice(1)] as const) },
    ];
  } else if (kind === "opportunity") {
    const r = data as unknown as Opportunity;
    fields = [
      { name: "title", label: "Title", value: r.title, wide: true, required: true, maxLength: 300 },
      { name: "organisation", label: "Organisation", value: str(r.organisation), maxLength: 200 },
      { name: "category", label: "Category", value: r.category, type: "select", options: OPP_CATEGORIES },
      { name: "url", label: "Link", value: str(r.url), type: "url" },
      { name: "deadline", label: "Deadline", value: day(r.deadline_at), type: "date" },
      { name: "fit_score", label: "Fit 0–100", value: str(r.fit_score), type: "number", min: 0, max: 100 },
      { name: "strategic_value", label: "Value 1–5", value: str(r.strategic_value), type: "number", min: 1, max: 5 },
      { name: "effort_hours", label: "Effort (hours)", value: str(r.effort_hours), type: "number", min: 0 },
      { name: "notes", label: "Notes", value: str(r.notes), type: "textarea", wide: true, maxLength: 5000 },
    ];
  } else {
    const r = data as unknown as Application;
    fields = [
      { name: "organisation", label: "Organisation", value: r.organisation, required: true, maxLength: 200 },
      { name: "role", label: "Role", value: r.role, required: true, maxLength: 300 },
      { name: "track", label: "Track", value: r.track, type: "select", options: APP_TRACKS },
      { name: "url", label: "Link", value: str(r.url), type: "url" },
      { name: "deadline", label: "Deadline", value: day(r.deadline_at), type: "date" },
      { name: "next_step_date", label: "Next step date", value: day(r.next_step_at), type: "date" },
      { name: "next_step", label: "Next step", value: str(r.next_step), wide: true, maxLength: 300 },
      { name: "notes", label: "Notes", value: str(r.notes), type: "textarea", wide: true, maxLength: 5000 },
    ];
  }

  return (
    <>
      <p className="kicker">Edit</p>
      <h1 className="mt-1 font-serif text-4xl">{title}</h1>
      <EditForm kind={kind} id={id} fields={fields} back={back} />
    </>
  );
}

export default function Page({ params }: PageProps<"/edit/[kind]/[id]">) {
  return <Suspense fallback={<Skeleton />}><Edit params={params} /></Suspense>;
}
