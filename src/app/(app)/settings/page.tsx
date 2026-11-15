import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { CopyField, ProfileForm, SourceForm } from "@/components/settings-forms";
import { Skeleton } from "@/components/skeleton";
import { ensureCalendarToken, removeSource, resetCalendarToken } from "@/lib/discovery";
import { requireUser } from "@/lib/supabase/server";
import { fmtDue } from "@/lib/time";

export const metadata: Metadata = { title: "Settings" };

async function Settings() {
  const { supabase } = await requireUser();
  const [token, { data: profile }, { data: sources }] = await Promise.all([
    ensureCalendarToken(),
    supabase.from("profiles").select("focus").maybeSingle(),
    supabase.from("sources").select("id,name,url,last_run_at,last_status").order("name"),
  ]);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const feed = `https://${host}/api/calendar/${token}.ics`;

  return (
    <>
      <p className="kicker">Setup</p>
      <h1 className="mt-1 font-serif text-4xl">Settings</h1>

      <section className="mt-6" aria-labelledby="h-cal">
        <h2 id="h-cal" className="eyebrow">Calendar feed for Apple Calendar</h2>
        <div className="card mt-2 space-y-3 p-4">
          <p className="text-sm">Subscribe once and every deadline here shows up in Apple Calendar, refreshed about hourly. The feed is read-only.</p>
          <CopyField value={feed} label="Calendar feed address" />
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Mac: Calendar → File → New Calendar Subscription, paste the address.</li>
            <li>iPhone: Settings → Apps → Calendar → Calendar Accounts → Add Account → Other → Add Subscribed Calendar.</li>
          </ol>
          <form action={resetCalendarToken} className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-xs text-muted">Anyone with this address can read your deadlines. Reset it if it leaks; you then need to subscribe again.</p>
            <button className="btn shrink-0">Reset address</button>
          </form>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="h-prof">
        <h2 id="h-prof" className="eyebrow">Profile used to score opportunities</h2>
        <div className="card mt-2"><ProfileForm focus={profile?.focus ?? ""} /></div>
      </section>

      <section className="mt-8" aria-labelledby="h-src">
        <h2 id="h-src" className="eyebrow">Sources the scan reads</h2>
        <div className="card mt-2">
          <ul className="divide-y divide-line">
            {(sources ?? []).map((s) => (
              <li key={s.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-accent-ink underline underline-offset-2">{s.url}</a>
                  <p className={`mt-0.5 text-xs ${s.last_status?.startsWith("failed") ? "text-signal" : "text-muted"}`}>
                    {s.last_run_at ? `Last scan ${fmtDue(new Date(s.last_run_at), false)} · ${s.last_status}` : "Not scanned yet"}
                  </p>
                </div>
                <form action={removeSource}>
                  <input type="hidden" name="id" value={s.id} />
                  <button aria-label={`Remove source ${s.name}`} className="grid size-8 place-items-center rounded text-muted hover:text-signal">×</button>
                </form>
              </li>
            ))}
          </ul>
          <div className="border-t border-line"><SourceForm /></div>
        </div>
        <p className="mt-2 text-xs text-muted">Add pages that list calls, programmes or openings. Each scan reads up to six sources, oldest first.</p>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Settings /></Suspense>;
}
