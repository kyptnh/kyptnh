"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { ok: boolean; message: string } | null;

export async function sendMagicLink(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = z.email().safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };

  // Optional allowlist so only you can sign in: ALLOWED_EMAILS="a@x.ch,b@y.com"
  const allowed = (process.env.ALLOWED_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length && !allowed.includes(parsed.data)) return { ok: false, message: "This email is not allowed to sign in." };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${proto}://${host}/auth/callback` },
  });
  if (error) return { ok: false, message: "Could not send the link. Wait a minute and try again." };
  return { ok: true, message: "Check your inbox. Open the link in this same browser." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
