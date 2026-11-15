import { removeRecord } from "@/lib/actions";

export function RemoveButton({ table, id, label }: { table: "opportunities" | "applications" | "goals" | "achievements" | "contacts" | "decisions"; id: string; label: string }) {
  return (
    <form action={removeRecord}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button aria-label={`Remove ${label}`} className="grid size-8 place-items-center rounded text-muted hover:text-signal">×</button>
    </form>
  );
}
