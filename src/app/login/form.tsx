"use client";
import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ linkError }: { linkError: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, null);
  return (
    <form action={action} className="mt-8 space-y-3">
      <label htmlFor="email" className="label">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" />
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Sending…" : "Send sign-in link"}</button>
      <p role="status" className={`min-h-5 text-sm ${state && !state.ok ? "text-signal" : "text-muted"}`}>
        {state?.message ?? (linkError ? "That link was invalid or expired. Request a new one." : "")}
      </p>
    </form>
  );
}
