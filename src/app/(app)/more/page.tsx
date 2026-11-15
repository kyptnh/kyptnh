import type { Metadata } from "next";
import Link from "next/link";
import { Spot } from "@/components/illustrations";

export const metadata: Metadata = { title: "More" };
const PAGES = [
  ["/network", "Network", "People, follow-ups and references", "people"],
  ["/growth", "Goals and wins", "What you are working towards and what you have achieved", "steps"],
  ["/decisions", "Decision Lab", "Weigh big choices side by side", "scales"],
  ["/copilot", "Co-pilot", "Ask about your data or get a briefing", "chat"],
  ["/insights", "Insights", "Where your effort is going", "summit"],
  ["/settings", "Settings", "Calendars, sources and profile", "plant"],
] as const;

export default function Page() {
  return (
    <>
      <h1 className="font-serif text-4xl">More</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {PAGES.map(([href, name, about, spot]) => (
          <li key={href}>
            <Link href={href} className="card flex items-center gap-4 p-4 hover:border-accent">
              <Spot name={spot} className="size-14 shrink-0" />
              <span><span className="block font-medium">{name}</span><span className="block text-sm text-muted">{about}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
