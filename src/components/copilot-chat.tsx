"use client";
import { useRef, useState, useTransition } from "react";
import { askCopilot, type Turn } from "@/lib/copilot";

const STARTERS = ["What should I work on this week?", "Which opportunity deserves my time most, and why?", "Am I over-committed in the next 14 days?", "Draft three interview stories from my achievements."];

export function CopilotChat() {
  const [log, setLog] = useState<Turn[]>([]);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const box = useRef<HTMLTextAreaElement>(null);

  const send = (text: string, briefing = false) => {
    const shown = briefing ? "Brief me on today." : text.trim();
    if (!shown || pending) return;
    setError("");
    const history = log.slice(-6);
    setLog((l) => [...l, { role: "you", text: shown }]);
    if (box.current) box.current.value = "";
    start(async () => {
      const res = await askCopilot(text, history, briefing);
      if (res.ok) setLog((l) => [...l, { role: "copilot", text: res.text }]);
      else setError(res.text);
    });
  };

  return (
    <div className="card mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <p className="text-sm">Start the day with a briefing, or ask anything about your deadlines, opportunities and goals.</p>
        <button type="button" className="btn-primary" disabled={pending} onClick={() => send("", true)}>Brief me on today</button>
      </div>

      <div aria-live="polite" className="space-y-3 p-4">
        {log.length === 0 && (
          <ul className="flex flex-wrap gap-2">
            {STARTERS.map((s) => <li key={s}><button type="button" className="btn h-auto py-2 text-left" disabled={pending} onClick={() => send(s)}>{s}</button></li>)}
          </ul>
        )}
        {log.map((t, i) => (
          <div key={i} className={t.role === "you" ? "ml-auto max-w-[85%] rounded-2xl bg-accent-soft px-4 py-2 text-sm" : "max-w-[92%] whitespace-pre-wrap rounded-2xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed"}>
            <span className="sr-only">{t.role === "you" ? "You: " : "Co-pilot: "}</span>{t.text}
          </div>
        ))}
        {pending && <p className="text-sm text-muted">Reading your data…</p>}
        {error && <p role="alert" className="text-sm text-signal">{error}</p>}
      </div>

      <form className="flex items-end gap-2 border-t border-line p-4" onSubmit={(e) => { e.preventDefault(); send(box.current?.value ?? ""); }}>
        <div className="flex-1">
          <label htmlFor="cp-q" className="label">Your question</label>
          <textarea id="cp-q" ref={box} rows={2} maxLength={2000} className="field h-auto py-2"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e.currentTarget.value); } }} />
        </div>
        <button className="btn-primary" disabled={pending}>Ask</button>
      </form>
    </div>
  );
}
