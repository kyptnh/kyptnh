# Career Command Center

Personal academic and career operating system. Next.js 16 (App Router) on Vercel, Supabase (Postgres, Auth, row-level security).

## Phase 1 (this commit)
- Magic-link sign-in, session refresh in `src/proxy.ts`
- `courses` and `items` tables with row-level security (`supabase/migrations`)
- Command Center: overdue, next 14 days, prep hours
- Academics: 12-week workload view, timeline by month, courses
- Quick add (⌘K / Ctrl+K), installable PWA manifest

## Setup
1. Copy `.env.example` to `.env.local` (the values are public, browser-safe keys).
2. Optional: set `ALLOWED_EMAILS` (comma-separated) so only you can sign in.
3. In Supabase → Authentication → URL Configuration, set the Site URL to the deployed URL and add `<url>/auth/callback` to Redirect URLs.
4. `npm run dev`, `npm test`, `npm run build`.

All times are stored in UTC and shown in Europe/Zurich.
