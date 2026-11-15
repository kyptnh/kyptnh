"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { createItem, type FormState } from "@/lib/actions";
import { ASSESSMENT_TYPES, KINDS, type Course } from "@/lib/types";

export function QuickAdd({ courses }: { courses: Course[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState("assessment");
  const [state, action, pending] = useActionState<FormState, FormData>(createItem, null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else dialog.current?.showModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (state?.ok) {
      form.current?.reset();
      dialog.current?.close();
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="btn-primary fixed bottom-18 right-4 z-20 h-12 shadow-lg md:bottom-6 md:right-6"
      >
        <span aria-hidden className="text-lg leading-none">+</span> Quick add
        <kbd className="num hidden text-xs opacity-70 md:inline">⌘K</kbd>
      </button>

      <dialog ref={dialog} aria-labelledby="qa-title" className="m-auto w-[min(34rem,calc(100vw-1.5rem))] rounded-xl border border-line bg-card p-0 text-ink">
        <form ref={form} action={action} className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 id="qa-title" className="font-serif text-2xl">Quick add</h2>
            <button type="button" onClick={() => dialog.current?.close()} className="text-sm text-muted hover:text-ink">Close</button>
          </div>

          <div>
            <label htmlFor="qa-t" className="label">Title</label>
            <input id="qa-t" name="title" required maxLength={300} autoFocus className="field" placeholder="e.g. Lobbying: Issue Reporting Sheet" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qa-k" className="label">Kind</label>
              <select id="qa-k" name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="field">
                {KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="qa-c" className="label">Course</label>
              <select id="qa-c" name="course_id" className="field" defaultValue="">
                <option value="">None</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code ? `${c.code} · ` : ""}{c.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="qa-d" className="label">Date</label>
              <input id="qa-d" name="date" type="date" required className="field" />
            </div>
            <div>
              <label htmlFor="qa-h" className="label">Time (optional)</label>
              <input id="qa-h" name="time" type="time" className="field" />
            </div>
            {kind === "assessment" && (
              <>
                <div>
                  <label htmlFor="qa-a" className="label">Type</label>
                  <select id="qa-a" name="assessment_type" className="field">
                    {ASSESSMENT_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="qa-w" className="label">Weight %</label>
                  <input id="qa-w" name="weight_pct" type="number" min={0} max={100} step="any" inputMode="decimal" className="field" />
                </div>
              </>
            )}
            <div>
              <label htmlFor="qa-e" className="label">Prep hours</label>
              <input id="qa-e" name="est_hours" type="number" min={0} step="any" inputMode="decimal" className="field" />
            </div>
          </div>

          <p className="text-xs text-muted">Times are Europe/Zurich. No time means end of day.</p>
          <div className="flex items-center justify-between gap-3">
            <p role="status" className="text-sm text-signal">{state && !state.ok ? state.message : ""}</p>
            <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Add"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
