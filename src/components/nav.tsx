"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Command Center", short: "Home" },
  { href: "/calendar", label: "Calendar", short: "Calendar" },
  { href: "/academics", label: "Academics", short: "Study" },
  { href: "/opportunities", label: "Opportunity Radar", short: "Radar" },
  { href: "/career", label: "Career Pipeline", short: "Career" },
  { href: "/settings", label: "Settings", short: "Setup" },
] as const;

export function Nav({ variant }: { variant: "side" | "bottom" }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className={variant === "side" ? "flex flex-col gap-0.5" : "grid grid-cols-6"}>
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
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
