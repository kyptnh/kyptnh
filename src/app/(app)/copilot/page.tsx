import type { Metadata } from "next";
import { CopilotChat } from "@/components/copilot-chat";
import { Spot } from "@/components/illustrations";

export const metadata: Metadata = { title: "Co-pilot" };
export const maxDuration = 120;

export default function Page() {
  return (
    <>
      <Spot name="chat" className="float-right -mt-2 ml-4 size-20 sm:size-24" />
      <p className="kicker">Ask your data</p>
      <h1 className="mt-1 font-serif text-4xl">Co-pilot</h1>
      <CopilotChat />
      <p className="mt-3 max-w-2xl text-xs text-muted">
        Each question sends your open deadlines, this week&apos;s calendar, opportunities, applications, goals, achievements and contact names to Google Gemini. On the free tier Google may use that to improve its products. The co-pilot only reads; it never changes or sends anything. Conversations are not saved.
      </p>
    </>
  );
}
