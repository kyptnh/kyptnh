import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RecordForm } from "@/components/edit-form";
import { Spot } from "@/components/illustrations";
import { RemoveButton } from "@/components/remove-button";
import { Skeleton } from "@/components/skeleton";
import { RECORDS, REFERENCE_STATUSES } from "@/lib/records";
import { requireUser } from "@/lib/supabase/server";
import { fmtDay, zonedDate } from "@/lib/time";

export const metadata: Metadata = { title: "Network" };
const REF: Record<string, string> = Object.fromEntries(REFERENCE_STATUSES);
type Contact = { id: string; name: string; organisation: string | null; role: string | null; strength: number | null; last_contact: string | null; follow_up: string | null; reference_status: string; notes: string | null };

function Row({ c, today }: { c: Contact; today: string }) {
  const due = c.follow_up && c.follow_up <= today;
  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <p className="text-sm font-medium">{c.name}</p>
        <p className="mt-0.5 text-xs text-muted">{[c.role, c.organisation].filter(Boolean).join(", ") || "No role added"}</p>
        {c.notes && <p className="mt-1 line-clamp-2 text-xs text-muted">{c.notes}</p>}
      </div>
      <div className="w-44 text-xs">
        {c.strength && <p aria-label={`Relationship strength ${c.strength} of 5`} className="tracking-widest text-accent-ink">{"●".repeat(c.strength)}<span className="text-line">{"●".repeat(5 - c.strength)}</span></p>}
        <p className="text-muted">{c.last_contact ? `Last contact ${fmtDay(c.last_contact)} ${c.last_contact.slice(0, 4)}` : "No contact logged"}</p>
        {c.follow_up && <p className={due ? "font-medium text-signal" : "text-muted"}>Follow up {fmtDay(c.follow_up)}{due ? " (due)" : ""}</p>}
        {c.reference_status !== "none" && <p><span className="badge mt-1 bg-[var(--t-sun)]">Reference: {REF[c.reference_status]}</span></p>}
      </div>
      <Link href={`/edit/contact/${c.id}`} aria-label={`Edit ${c.name}`} className="text-xs text-accent-ink underline-offset-2 hover:underline">Edit</Link>
      <RemoveButton table="contacts" id={c.id} label={c.name} />
    </li>
  );
}

async function Network() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("contacts").select(RECORDS.contact.cols).is("deleted_at", null).order("name");
  const contacts = (data ?? []) as unknown as Contact[];
  const today = zonedDate(new Date());
  const due = contacts.filter((c) => c.follow_up && c.follow_up <= today).sort((a, b) => a.follow_up!.localeCompare(b.follow_up!));
  const refs = contacts.filter((c) => ["to_ask", "asked"].includes(c.reference_status));

  return (
    <>
      <Spot name="people" className="float-right -mt-2 ml-4 size-20 sm:size-24" />
      <p className="kicker">People</p>
      <h1 className="mt-1 font-serif text-4xl">Network</h1>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[["Contacts", contacts.length, "var(--t-sky)"], ["Follow-ups due", due.length, "var(--t-peach)"], ["References in progress", refs.length, "var(--t-sun)"]].map(([k, v, color]) => (
          <div key={String(k)} className="rounded-2xl p-4" style={{ background: String(color) }}><dt className="label">{k}</dt><dd className="num mt-1 text-3xl">{v}</dd></div>
        ))}
      </dl>

      {due.length > 0 && (
        <section className="mt-8" aria-labelledby="h-due">
          <h2 id="h-due" className="eyebrow text-signal">Follow up now</h2>
          <ul className="card mt-2 divide-y divide-line">{due.map((c) => <Row key={c.id} c={c} today={today} />)}</ul>
        </section>
      )}

      <section className="mt-8" aria-labelledby="h-all">
        <h2 id="h-all" className="eyebrow">Everyone</h2>
        <div className="card mt-2">
          {contacts.length > 0 ? <ul className="divide-y divide-line">{contacts.map((c) => <Row key={c.id} c={c} today={today} />)}</ul> : <p className="p-6 text-sm text-muted">No contacts yet. Start with the people you met at recent events and anyone you might ask for a reference.</p>}
          <details className="border-t border-line" open={contacts.length === 0}>
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-accent-ink">Add a contact</summary>
            <RecordForm kind="contact" fields={RECORDS.contact.fields()} submit="Add contact" />
          </details>
        </div>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Network /></Suspense>;
}
