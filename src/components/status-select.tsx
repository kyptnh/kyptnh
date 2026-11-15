"use client";
import { setRecordStatus } from "@/lib/actions";

export function StatusSelect({ table, id, status, options, label }: { table: "opportunities" | "applications"; id: string; status: string; options: readonly (readonly [string, string])[]; label: string }) {
  return (
    <form action={setRecordStatus}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <select
        name="status" aria-label={`Status of ${label}`} defaultValue={status} key={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-8 rounded-md border border-line bg-card px-2 text-xs"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </form>
  );
}
