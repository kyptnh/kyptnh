"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Command Center", short: "Home", main: true },
  { href: "/calendar", label: "Calendar", short: "Calendar", main: true },
  { href: "/academics", label: "Academics", short: "Study", main: true },
  { href: "/opportunities", label: "Opportunity Radar", short: "Radar", main: true },
  { href: "/career", label: "Career Pipeline", short: "Career", main: true },
  { href: "/network", label: "Network", short: "Network", main: false },
  { href: "/growth", label: "Goals and wins", short: "Goals", main: false },
  { href: "/decisions", label: "Decision Lab", short: "Decide", main: false },
  { href: "/copilot", label: "Co-pilot", short: "Co-pilot", main: false },
  { href: "/insights", label: "Insights", short: "Insights", main: false },
  { href: "/settings", label: "Settings", short: "Setup", main: false },
] as const;
const MORE = { href: "/more", label: "More", short: "More", main: true } as const;

export function Nav({ variant }: { variant: "side" | "bottom" }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className={variant === "side" ? "flex flex-col gap-0.5" : "grid grid-cols-6"}>
      {(variant === "side" ? LINKS : [...LINKS.filter((l) => l.main), MORE]).map((l) => {
        const active = l.href === "/" ? path === "/" : l.href === "/more" ? LINKS.some((x) => !x.main && path.startsWith(x.href)) || path === "/more" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              variant === "side"
                ? `rounded-full px-4 py-2 text-sm ${active ? "bg-accent-soft font-semibold text-accent-ink" : "text-muted hover:bg-paper hover:text-ink"}`
                : `flex h-14 items-center justify-center border-t-2 text-[11px] ${active ? "border-accent font-semibold text-accent-ink" : "border-transparent text-muted"}`
            }
          >
            {variant === "side" ? l.label : l.short}
          </Link>
        );
      })}
    </nav>
  );
}
