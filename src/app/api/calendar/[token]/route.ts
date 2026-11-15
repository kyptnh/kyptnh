import { createClient } from "@supabase/supabase-js";
import { buildIcs, type FeedRow } from "@/lib/ics";

export async function GET(_: Request, { params }: RouteContext<"/api/calendar/[token]">) {
  const token = (await params).token.replace(/\.ics$/, "");
  if (!/^[a-f0-9]{32,128}$/.test(token)) return new Response("Not found", { status: 404 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("calendar_feed", { p_token: token });
  if (error) return new Response("Calendar unavailable", { status: 502 });
  return new Response(buildIcs((data ?? []) as FeedRow[], new Date()), {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "private, max-age=900" },
  });
}
