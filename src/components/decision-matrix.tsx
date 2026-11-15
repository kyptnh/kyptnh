"use client";
import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions";
import { decisionTotals, type Criterion } from "@/lib/decision-math";
import { saveScores } from "@/lib/decisions";

export function DecisionMatrix({ id, options, criteria, initial, notes }: { id: string; options: string[]; criteria: Criterion[]; initial: Record<string, number>; notes: string }) {
  const [scores, setScores] = useState(initial);
  const [state, action, pending] = useActionState<FormState, FormData>(saveScores, null);
  const totals = decisionTotals(options, criteria, scores);
  const best = Math.max(...totals);
  return (
    <form action={action} className="p-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="scores" value={JSON.stringify(scores)} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Criterion (weight)</th>
              {options.map((o) => <th key={o} scope="col" className="px-2 py-2 font-medium">{o}</th>)}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={c.name} className="border-t border-line">
                <th scope="row" className="py-2 pr-3 text-left font-normal">{c.name} <span className="num text-xs text-muted">×{c.weight}</span></th>
                {options.map((o, j) => (
                  <td key={o} className="px-2 py-2">
                    <input type="number" min={0} max={5} step={1} inputMode="numeric" aria-label={`${o}: ${c.name}, score 0 to 5`}
                      value={scores[`${i}-${j}`] ?? ""} placeholder="0–5"
                      onChange={(e) => {
                        const v = e.target.value === "" ? undefined : Math.min(5, Math.max(0, Number(e.target.value)));
                        setScores((s) => { const n = { ...s }; if (v === undefined || Number.isNaN(v)) delete n[`${i}-${j}`]; else n[`${i}-${j}`] = v; return n; });
                      }}
                      className="field mt-0 h-9 w-20" />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-ink/20">
              <th scope="row" className="py-3 pr-3 text-left">Weighted result</th>
              {totals.map((t, j) => (
                <td key={options[j]} className="px-2 py-3">
                  <span className={`num inline-block rounded-full px-3 py-1 text-sm font-semibold ${t === best && best > 0 ? "bg-accent text-white" : "bg-paper"}`}>{t}%</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <label htmlFor={`dn-${id}`} className="label mt-3">Assumptions and what would change your mind</label>
      <textarea id={`dn-${id}`} name="notes" defaultValue={notes} rows={2} maxLength={5000} className="field h-auto py-2" />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p role="status" className={`text-sm ${state?.ok ? "text-ok" : "text-signal"}`}>{state?.message ?? "Score each option from 0 (poor) to 5 (excellent)."}</p>
        <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save scores"}</button>
      </div>
    </form>
  );
}
