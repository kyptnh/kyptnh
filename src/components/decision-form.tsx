"use client";
import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/lib/actions";
import { createDecision } from "@/lib/decisions";

export function DecisionForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(createDecision, null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3 p-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><label htmlFor="d-t" className="label">Decision</label><input id="d-t" name="title" required maxLength={300} placeholder="Where do I spend next year?" className="field" /></div>
      <div><label htmlFor="d-o" className="label">Options, one per line</label><textarea id="d-o" name="options" required rows={4} placeholder={"Exchange semester\nFletcher double degree\nCEMS MiM"} className="field h-auto py-2" /></div>
      <div><label htmlFor="d-c" className="label">Criteria, one per line, with a weight from 1 to 10</label><textarea id="d-c" name="criteria" required rows={4} placeholder={"Career value: 9\nCost: 6\nNetwork: 7"} className="field h-auto py-2" /></div>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <p role="status" className={`text-sm ${state?.ok ? "text-ok" : "text-signal"}`}>{state?.message ?? ""}</p>
        <button className="btn-primary" disabled={pending}>{pending ? "Creating…" : "Create decision"}</button>
      </div>
    </form>
  );
}
