"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/lib/actions";
import { addCalendar } from "@/lib/calendars";
import { addSource, saveProfile } from "@/lib/discovery";

function Status({ state }: { state: FormState }) {
  return <p role="status" className={`text-sm ${state?.ok ? "text-ok" : "text-signal"}`}>{state?.message ?? ""}</p>;
}

export function ProfileForm({ focus }: { focus: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, null);
  return (
    <form action={action} className="space-y-3 p-4">
      <label htmlFor="p-f" className="label">Who you are and what you are looking for</label>
      <textarea id="p-f" name="focus" defaultValue={focus} maxLength={4000} rows={6} className="field h-auto py-2 leading-relaxed" />
      <div className="flex items-center justify-between gap-3"><Status state={state} /><button className="btn" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button></div>
    </form>
  );
}

export function SourceForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(addSource, null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3 p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
      <div><label htmlFor="s-n" className="label">Name</label><input id="s-n" name="name" required maxLength={120} className="field" /></div>
      <div><label htmlFor="s-u" className="label">Page address</label><input id="s-u" name="url" type="url" required placeholder="https://" className="field" /></div>
      <button className="btn" disabled={pending}>{pending ? "Adding…" : "Add source"}</button>
      <div className="sm:col-span-3"><Status state={state} /></div>
    </form>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input readOnly aria-label={label} value={value} onFocus={(e) => e.currentTarget.select()} className="field num mt-0 text-xs" />
      <button type="button" className="btn shrink-0" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function CalendarForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(addCalendar, null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3 p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
      <div><label htmlFor="k-n" className="label">Name</label><input id="k-n" name="name" required maxLength={120} placeholder="Personal" className="field" /></div>
      <div><label htmlFor="k-u" className="label">Public calendar address</label><input id="k-u" name="url" required placeholder="webcal://" className="field" /></div>
      <button className="btn" disabled={pending}>{pending ? "Importing…" : "Connect"}</button>
      <div className="sm:col-span-3"><Status state={state} /></div>
    </form>
  );
}
