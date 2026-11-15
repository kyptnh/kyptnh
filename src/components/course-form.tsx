"use client";
import { useActionState, useEffect, useRef } from "react";
import { createCourse, type FormState } from "@/lib/actions";
import { COLORS } from "@/lib/types";

export function CourseForm() {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(createCourse, null);
  useEffect(() => { if (state?.ok) form.current?.reset(); }, [state]);
  return (
    <form ref={form} action={action} className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-6">
      <div className="col-span-2 sm:col-span-2">
        <label htmlFor="c-t" className="label">Course title</label>
        <input id="c-t" name="title" required maxLength={200} className="field" />
      </div>
      <div>
        <label htmlFor="c-c" className="label">Code</label>
        <input id="c-c" name="code" maxLength={40} className="field" />
      </div>
      <div>
        <label htmlFor="c-s" className="label">Semester</label>
        <input id="c-s" name="semester" maxLength={40} placeholder="HS 2026" className="field" />
      </div>
      <div>
        <label htmlFor="c-e" className="label">ECTS</label>
        <input id="c-e" name="ects" type="number" min={0} max={60} step="any" inputMode="decimal" className="field" />
      </div>
      <div>
        <label htmlFor="c-o" className="label">Colour</label>
        <select id="c-o" name="color" className="field capitalize">{COLORS.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-6">
        <p role="status" className={`text-sm ${state?.ok ? "text-ok" : "text-signal"}`}>{state?.message ?? ""}</p>
        <button className="btn" disabled={pending}>{pending ? "Saving…" : "Add course"}</button>
      </div>
    </form>
  );
}
