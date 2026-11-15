"use client";
import { useActionState, useEffect, useRef } from "react";
import { createApplication, createOpportunity, type FormState } from "@/lib/actions";
import { APP_TRACKS, OPP_CATEGORIES } from "@/lib/types";

function useForm(fn: (s: FormState, f: FormData) => Promise<FormState>) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(fn, null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return { ref, state, action, pending };
}

function Footer({ state, pending, label }: { state: FormState; pending: boolean; label: string }) {
  return (
    <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-6">
      <p role="status" className={`text-sm ${state?.ok ? "text-ok" : "text-signal"}`}>{state?.message ?? ""}</p>
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : label}</button>
    </div>
  );
}

export function OpportunityForm() {
  const { ref, state, action, pending } = useForm(createOpportunity);
  return (
    <form ref={ref} action={action} className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-6">
      <div className="col-span-2 sm:col-span-3"><label htmlFor="o-t" className="label">Title</label><input id="o-t" name="title" required maxLength={300} className="field" /></div>
      <div className="col-span-2 sm:col-span-3"><label htmlFor="o-o" className="label">Organisation</label><input id="o-o" name="organisation" maxLength={200} className="field" /></div>
      <div className="col-span-2"><label htmlFor="o-c" className="label">Category</label><select id="o-c" name="category" className="field">{OPP_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="col-span-2"><label htmlFor="o-u" className="label">Link</label><input id="o-u" name="url" type="url" placeholder="https://" className="field" /></div>
      <div className="col-span-2"><label htmlFor="o-d" className="label">Deadline</label><input id="o-d" name="deadline" type="date" className="field" /></div>
      <div className="sm:col-span-2"><label htmlFor="o-f" className="label">Fit 0–100</label><input id="o-f" name="fit_score" type="number" min={0} max={100} inputMode="numeric" className="field" /></div>
      <div className="sm:col-span-2"><label htmlFor="o-v" className="label">Value 1–5</label><input id="o-v" name="strategic_value" type="number" min={1} max={5} inputMode="numeric" className="field" /></div>
      <div className="col-span-2"><label htmlFor="o-e" className="label">Effort (hours)</label><input id="o-e" name="effort_hours" type="number" min={0} step="any" inputMode="decimal" className="field" /></div>
      <div className="col-span-2 sm:col-span-6"><label htmlFor="o-n" className="label">Notes</label><input id="o-n" name="notes" maxLength={5000} className="field" /></div>
      <Footer state={state} pending={pending} label="Add opportunity" />
    </form>
  );
}

export function ApplicationForm() {
  const { ref, state, action, pending } = useForm(createApplication);
  return (
    <form ref={ref} action={action} className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-6">
      <div className="col-span-2 sm:col-span-3"><label htmlFor="a-o" className="label">Organisation</label><input id="a-o" name="organisation" required maxLength={200} className="field" /></div>
      <div className="col-span-2 sm:col-span-3"><label htmlFor="a-r" className="label">Role</label><input id="a-r" name="role" required maxLength={300} className="field" /></div>
      <div className="col-span-2"><label htmlFor="a-t" className="label">Track</label><select id="a-t" name="track" className="field">{APP_TRACKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="col-span-2"><label htmlFor="a-u" className="label">Link</label><input id="a-u" name="url" type="url" placeholder="https://" className="field" /></div>
      <div className="col-span-2"><label htmlFor="a-d" className="label">Deadline</label><input id="a-d" name="deadline" type="date" className="field" /></div>
      <div className="col-span-2 sm:col-span-4"><label htmlFor="a-n" className="label">Next step</label><input id="a-n" name="next_step" maxLength={300} placeholder="e.g. Record video interview" className="field" /></div>
      <div className="col-span-2"><label htmlFor="a-nd" className="label">Next step date</label><input id="a-nd" name="next_step_date" type="date" className="field" /></div>
      <Footer state={state} pending={pending} label="Add application" />
    </form>
  );
}
