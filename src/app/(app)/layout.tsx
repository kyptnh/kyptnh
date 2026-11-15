import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { QuickAdd } from "@/components/quick-add";
import { signOut } from "@/app/login/actions";
import { getCourses } from "@/lib/data";

async function QuickAddLoader() {
  return <QuickAdd courses={await getCourses()} />;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line p-4 md:flex">
        <p className="eyebrow px-3 pt-2">Career</p>
        <p className="px-3 pb-6 font-serif text-xl">Command Center</p>
        <Suspense><Nav variant="side" /></Suspense>
        <form action={signOut} className="mt-auto">
          <button className="px-3 py-2 text-sm text-muted hover:text-ink">Sign out</button>
        </form>
      </aside>
      <main className="mx-auto w-full max-w-4xl px-4 pb-36 pt-8 md:px-10 md:pb-24">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-paper md:hidden">
        <Suspense><Nav variant="bottom" /></Suspense>
      </div>
      <Suspense><QuickAddLoader /></Suspense>
    </div>
  );
}
