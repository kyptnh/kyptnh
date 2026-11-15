"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live countdown to the next deadline. Starts from the server's clock, then ticks in the browser. */
export function MissionClock({ target, serverNow, title, detail, color, href }: { target: string; serverNow: string; title: string; detail: string; color: string; href: string }) {
  const [now, setNow] = useState(() => Date.parse(serverNow));
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.floor((Date.parse(target) - now) / 1000));
  const parts: [string, string][] = [[String(Math.floor(left / 86400)), "days"], [pad(Math.floor(left / 3600) % 24), "hrs"], [pad(Math.floor(left / 60) % 60), "min"], [pad(left % 60), "sec"]];
  const urgent = left < 3 * 86400;
  return (
    <div>
      <p className="text-xs font-medium text-muted">Next deadline in</p>
      <div className="mt-2 flex items-end gap-3 sm:gap-5" role="timer" aria-label={`${parts[0][0]} days, ${parts[1][0]} hours and ${parts[2][0]} minutes until ${title}`}>
        {parts.map(([v, unit]) => (
          <div key={unit} aria-hidden>
            <p className={`font-pixel text-5xl leading-none sm:text-7xl ${urgent ? "text-signal" : "text-accent"}`} style={{ textShadow: "0 0 28px color-mix(in srgb, currentColor 45%, transparent)" }}>{v}</p>
            <p className="mt-1 text-[11px] text-muted">{unit}</p>
          </div>
        ))}
      </div>
      <Link href={href} className="mt-4 flex items-center gap-2 text-sm hover:text-accent-ink">
        <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded text-[11px] font-bold text-[#1b1300]" style={{ background: color }}>!</span>
        <span className="truncate font-medium">{title}</span>
        <span className="hidden shrink-0 text-muted sm:inline">{detail}</span>
      </Link>
    </div>
  );
}
