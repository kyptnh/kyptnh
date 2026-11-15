"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { saveRecord, updateRecord, type FormState } from "@/lib/actions";

export type Field = {
  name: string; label: string; value: string; wide?: boolean; required?: boolean; maxLength?: number;
  type?: "text" | "number" | "date" | "time" | "url" | "textarea" | "select";
  options?: readonly (readonly [string, string])[]; min?: number; max?: number;
};

export function EditForm({ kind, id, fields, back }: { kind: string; id: string; fields: Field[]; back: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateRecord, null);
  return (
    <form action={action} className="card mt-6 grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
      <input type="hidden" name="_kind" value={kind} />
      <input type="hidden" name="_id" value={id} />
      {fields.map((f) => {
        const idAttr = `e-${f.name}`;
        const common = { id: idAttr, name: f.name, defaultValue: f.value, required: f.required, className: "field" };
        return (
          <div key={f.name} className={f.wide ? "col-span-2 sm:col-span-4" : "col-span-2"}>
            <label htmlFor={idAttr} className="label">{f.label}</label>
            {f.type === "select" ? (
              <select {...common}>{f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            ) : f.type === "textarea" ? (
              <textarea {...common} rows={4} maxLength={f.maxLength} className="field h-auto py-2" />
            ) : (
              <input {...common} type={f.type ?? "text"} maxLength={f.maxLength} min={f.min} max={f.max} step={f.type === "number" ? "any" : undefined} />
            )}
          </div>
        );
      })}
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-4">
        <p role="status" className="text-sm text-signal">{state && !state.ok ? state.message : ""}</p>
        <div className="flex gap-2">
          <Link href={back} className="btn">Cancel</Link>
          <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </form>
  );
}

/** Add or edit form for goals, achievements and contacts. Without an id it adds and clears itself. */
export function RecordForm({ kind, id, fields, back, submit }: { kind: string; id?: string; fields: Field[]; back?: string; submit: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(saveRecord, null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
      <input type="hidden" name="_kind" value={kind} />
      {id && <input type="hidden" name="_id" value={id} />}
      {fields.map((f) => {
        const idAttr = `r-${kind}-${f.name}`;
        const common = { id: idAttr, name: f.name, defaultValue: f.value, required: f.required, className: "field" };
        return (
          <div key={f.name} className={f.wide ? "col-span-2 sm:col-span-4" : "col-span-2"}>
            <label htmlFor={idAttr} className="label">{f.label}</label>
            {f.type === "select" ? (
              <select {...common}>{f.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            ) : f.type === "textarea" ? (
              <textarea {...common} rows={3} maxLength={f.maxLength} className="field h-auto py-2" />
            ) : (
              <input {...common} type={f.type ?? "text"} maxLength={f.maxLength} min={f.min} max={f.max} step={f.type === "number" ? "any" : undefined} />
            )}
          </div>
        );
      })}
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-4">
        <p role="status" className={`text-sm ${state?.ok ? "text-ok" : "text-signal"}`}>{state?.message ?? ""}</p>
        <div className="flex gap-2">
          {back && <Link href={back} className="btn">Cancel</Link>}
          <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : submit}</button>
        </div>
      </div>
    </form>
  );
}
