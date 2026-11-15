"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Command Center", short: "Home" },
  { href: "/academics", label: "Academics", short: "Academics" },
] as const;

export function Nav({ variant }: { variant: "side" | "bottom" }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className={variant === "side" ? "flex flex-col gap-0.5" : "grid grid-cols-2"}>
      {LINKS.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={
              variant === "side"
                ? `rounded-md px-3 py-2 text-sm ${active ? "bg-ink text-paper" : "text-muted hover:text-ink"}`
                : `flex h-14 items-center justify-center text-sm ${active ? "font-medium text-ink" : "text-muted"}`
            }
          >
            {variant === "side" ? l.label : l.short}
          </Link>
        );
      })}
    </nav>
  );
}
