import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { CalendarForm, CopyField, FeedColor, ProfileForm, SourceForm } from "@/components/settings-forms";
import { removeCalendar, syncCalendars } from "@/lib/calendars";
import { Skeleton } from "@/components/skeleton";
import { ensureCalendarToken, removeSource, resetCalendarToken } from "@/lib/discovery";
import { requireUser } from "@/lib/supabase/server";
import { fmtDue } from "@/lib/time";

export const metadata: Metadata = { title: "Settings" };
export const maxDuration = 120;

async function Settings() {
  const { supabase } = await requireUser();
  const [token, { data: profile }, { data: sources }, { data: feeds }] = await Promise.all([
    ensureCalendarToken(),
    supabase.from("profiles").select("focus").maybeSingle(),
    supabase.from("sources").select("id,name,url,last_run_at,last_status").order("name"),
    supabase.from("calendar_feeds").select("id,name,color,last_synced_at,last_status").order("name"),
  ]);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const feed = `https://${host}/api/calendar/${token}.ics`;

  return (
    <>
      <p className="kicker">Setup</p>
      <h1 className="mt-1 font-display font-semibold tracking-tight text-4xl">Settings</h1>

      <section className="mt-6" aria-labelledby="h-cal">
        <h2 id="h-cal" className="eyebrow">Send your deadlines to Apple Calendar</h2>
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

      <section className="mt-8" aria-labelledby="h-in">
        <h2 id="h-in" className="eyebrow">Bring your Apple Calendar in</h2>
        <div className="card mt-2">
          <div className="space-y-2 p-4 text-sm">
            <p>Share a calendar publicly from iCloud and paste its address here. Its events then appear in the Calendar view, from 30 days back to 180 days ahead.</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted">
              <li>Mac: Calendar → right-click the calendar → Share Calendar → tick Public Calendar → copy the address.</li>
              <li>iPhone: Calendar → Calendars → the ⓘ next to the calendar → Public Calendar → Share Link.</li>
            </ol>
            <p className="text-xs text-muted">A public address lets anyone who has it read that calendar, so share only calendars you are comfortable exposing. Events are copied in when you press Sync; they are not live.</p>
          </div>
          {(feeds ?? []).length > 0 && (
            <ul className="divide-y divide-line border-t border-line">
              {(feeds ?? []).map((f) => (
                <li key={f.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className={`mt-0.5 text-xs ${f.last_status?.startsWith("failed") ? "text-signal" : "text-muted"}`}>
                      {f.last_synced_at ? `Last sync ${fmtDue(new Date(f.last_synced_at), false)} · ${f.last_status}` : "Not synced yet"}
                    </p>
                  </div>
                  <FeedColor id={f.id} color={f.color} name={f.name} />
                  <form action={removeCalendar}>
                    <input type="hidden" name="id" value={f.id} />
                    <button aria-label={`Disconnect calendar ${f.name}`} className="grid size-8 place-items-center rounded text-muted hover:text-signal">×</button>
                  </form>
                </li>
              ))}
              <li className="flex justify-end px-4 py-3"><form action={syncCalendars}><button className="btn">Sync now</button></form></li>
            </ul>
          )}
          <div className="border-t border-line"><CalendarForm /></div>
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
        <p className="mt-2 text-xs text-muted">Add pages that list calls, programmes or openings. Each scan reads up to 18 sources, starting with the ones scanned longest ago, so a long list takes several scans to cover.</p>
      </section>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Settings /></Suspense>;
}
