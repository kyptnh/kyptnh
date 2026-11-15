"use client";
import { useActionState, useState } from "react";
import { extractAssessments, saveImported, type ImportRow, type ImportState } from "@/lib/import";
import { ASSESSMENT_TYPES, type Course } from "@/lib/types";

type Draft = ImportRow & { keep: boolean };

function Review({ rows, courseId, onDone }: { rows: ImportRow[]; courseId?: string; onDone: () => void }) {
  const [drafts, setDrafts] = useState<Draft[]>(() => rows.map((r) => ({ ...r, keep: !!r.date })));
  const [state, action, pending] = useActionState<ImportState, FormData>(saveImported, null);
  const set = (i: number, patch: Partial<Draft>) => setDrafts((d) => d.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const kept = drafts.filter((d) => d.keep);
  const payload = JSON.stringify(kept.map((d) => ({ title: d.title, assessment_type: d.assessment_type, date: d.date, time: d.time || null, weight_pct: d.weight_pct, est_hours: d.est_hours })));

  if (state?.ok) {
    return (
      <div className="flex items-center justify-between gap-3 p-4">
        <p role="status" className="text-sm text-ok">{state.message}</p>
        <button type="button" className="btn" onClick={onDone}>Import another</button>
      </div>
    );
  }
  return (
    <form action={action} className="p-4">
      <input type="hidden" name="rows" value={payload} />
      <input type="hidden" name="course_id" value={courseId ?? ""} />
      <p className="text-sm">Nothing is saved yet. Untick anything wrong, correct the details, then save.</p>
      <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
        {drafts.map((d, i) => (
          <li key={i} className="grid gap-2 p-3 sm:grid-cols-[auto_1fr_9rem_6.5rem_5rem]">
            <input type="checkbox" checked={d.keep} onChange={(e) => set(i, { keep: e.target.checked })} aria-label={`Include ${d.title}`} className="mt-3 size-4 accent-[var(--accent)]" />
            <div>
              <input aria-label="Title" value={d.title} onChange={(e) => set(i, { title: e.target.value })} className="field mt-0" />
              {d.quote && <p className="mt-1 text-xs text-muted">From the document: “{d.quote}”</p>}
              {!d.date && <p className="mt-1 text-xs font-medium text-signal">No specific date in the document. Add one to include it.</p>}
            </div>
            <select aria-label="Type" value={d.assessment_type} onChange={(e) => set(i, { assessment_type: e.target.value as Draft["assessment_type"] })} className="field mt-0">
              {ASSESSMENT_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input aria-label="Date" type="date" value={d.date ?? ""} onChange={(e) => set(i, { date: e.target.value || null, keep: !!e.target.value })} className="field mt-0" />
            <input aria-label="Time" type="time" value={d.time ?? ""} onChange={(e) => set(i, { time: e.target.value || null })} className="field mt-0" />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p role="status" className="text-sm text-signal">{state && !state.ok ? state.message : ""}</p>
        <div className="flex gap-2">
          <button type="button" className="btn" onClick={onDone}>Discard</button>
          <button className="btn-primary" disabled={pending || kept.length === 0 || kept.some((d) => !d.date || !d.title.trim())}>
            {pending ? "Saving…" : `Save ${kept.length} to timeline`}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ImportSyllabus({ courses }: { courses: Course[] }) {
  const [state, action, pending] = useActionState<ImportState, FormData>(extractAssessments, null);
  const [round, setRound] = useState(0);
  const [dismissed, setDismissed] = useState<ImportState>(null);
  const showReview = state?.ok && state.rows && state !== dismissed;

  if (showReview) return <Review key={round} rows={state.rows!} courseId={state.course_id} onDone={() => { setDismissed(state); setRound((r) => r + 1); }} />;
  return (
    <form action={action} className="grid gap-3 p-4 sm:grid-cols-2">
      <div>
        <label htmlFor="im-f" className="label">Syllabus (PDF or text file, up to 8 MB)</label>
        <input id="im-f" name="file" type="file" accept="application/pdf,text/plain" className="field h-auto py-2 file:mr-3 file:rounded file:border-0 file:bg-accent-soft file:px-2 file:py-1 file:text-accent-ink" />
      </div>
      <div>
        <label htmlFor="im-c" className="label">Course</label>
        <select id="im-c" name="course_id" defaultValue="" className="field">
          <option value="">None</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.code ? `${c.code} · ` : ""}{c.title}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="im-t" className="label">Or paste the text</label>
        <textarea id="im-t" name="text" rows={3} maxLength={60000} className="field h-auto py-2" />
      </div>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <p role="status" className="text-sm text-signal">{state && !state.ok ? state.message : ""}</p>
        <button className="btn-primary" disabled={pending}>{pending ? "Reading the document…" : "Find assessments"}</button>
      </div>
      <p className="text-xs text-muted sm:col-span-2">The document is sent to Google Gemini to be read. You review every item before anything is saved.</p>
    </form>
  );
}
