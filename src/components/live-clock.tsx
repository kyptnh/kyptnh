"use client";
import { useEffect, useState } from "react";

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", ...o }).format(d);

/** Zurich wall clock for the console rail. Renders after mount so the server and browser never disagree. */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="num mt-2 text-sm text-accent-ink" aria-label="Current time in Zurich">
      {now ? fmt(now, { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }) : "--:--:--"}
      <span className="ml-2 text-xs text-muted">{now ? fmt(now, { weekday: "short", day: "numeric", month: "short" }) : ""}</span>
    </p>
  );
}
