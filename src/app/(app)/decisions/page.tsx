import type { Metadata } from "next";
import { Suspense } from "react";
import { DecisionForm } from "@/components/decision-form";
import { DecisionMatrix } from "@/components/decision-matrix";
import { Spot } from "@/components/illustrations";
import { RemoveButton } from "@/components/remove-button";
import { Skeleton } from "@/components/skeleton";
import type { Criterion } from "@/lib/decision-math";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Decision Lab" };
type Decision = { id: string; title: string; options: string[]; criteria: Criterion[]; scores: Record<string, number>; notes: string | null };

async function Decisions() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("decisions").select("id,title,options,criteria,scores,notes").is("deleted_at", null).order("created_at", { ascending: false });
  const decisions = (data ?? []) as Decision[];
  return (
    <>
      <Spot name="scales" className="float-right -mt-2 ml-4 size-20 sm:size-24" />
      <p className="kicker">Big choices</p>
      <h1 className="mt-1 font-serif text-4xl">Decision Lab</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">List the options and what matters, weight each criterion, then score. The result shows which option fits your own priorities best. It informs the choice; it does not make it.</p>

      {decisions.map((d) => (
        <section key={d.id} className="mt-6" aria-label={d.title}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl">{d.title}</h2>
            <RemoveButton table="decisions" id={d.id} label={d.title} />
          </div>
          <div className="card mt-2"><DecisionMatrix id={d.id} options={d.options} criteria={d.criteria} initial={d.scores ?? {}} notes={d.notes ?? ""} /></div>
        </section>
      ))}

      <section className="mt-8" aria-labelledby="h-new">
        <h2 id="h-new" className="eyebrow">Start a decision</h2>
        <div className="card mt-2"><DecisionForm /></div>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Decisions /></Suspense>;
}
