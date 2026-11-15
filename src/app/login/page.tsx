import { Suspense } from "react";
import { LoginForm } from "./form";

async function Form({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <LoginForm linkError={(await searchParams).error === "link"} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Career Command Center</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">No password. A one-time link is sent to your email.</p>
        <Suspense fallback={<div className="mt-8 h-40" />}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
