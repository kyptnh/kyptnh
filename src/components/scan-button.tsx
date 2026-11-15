"use client";
import { useActionState } from "react";
import type { FormState } from "@/lib/actions";
import { runDiscovery } from "@/lib/discovery";

export function ScanButton() {
  const [state, action, pending] = useActionState<FormState, FormData>(runDiscovery, null);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <button className="btn-primary" disabled={pending}>{pending ? "Scanning… this can take a few minutes" : "Scan for opportunities"}</button>
      <p role="status" className={`text-xs ${state && !state.ok ? "text-signal" : "text-muted"}`}>{state?.message ?? ""}</p>
    </form>
  );
}
