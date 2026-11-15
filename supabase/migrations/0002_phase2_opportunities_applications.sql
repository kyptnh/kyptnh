-- Applied to the hosted project on 2026-11-15. See the Supabase migration history for the canonical copy.
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  organisation text,
  category text not null default 'other' check (category in ('fellowship','competition','conference','think_tank','volunteering','research','accelerator','leadership','course','other')),
  url text,
  deadline_at timestamptz,
  all_day boolean not null default true,
  tz text not null default 'Europe/Zurich',
  status text not null default 'discovered' check (status in ('discovered','shortlisted','preparing','submitted','interview','accepted','rejected','dropped')),
  fit_score int check (fit_score is null or (fit_score between 0 and 100)),
  strategic_value int check (strategic_value is null or (strategic_value between 1 and 5)),
  effort_hours numeric(6,1) check (effort_hours is null or effort_hours >= 0),
  notes text,
  source text not null default 'manual',
  verified boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  organisation text not null check (char_length(organisation) between 1 and 200),
  role text not null check (char_length(role) between 1 and 300),
  track text not null default 'private' check (track in ('private','diplomacy','io','startup','other')),
  url text,
  deadline_at timestamptz,
  status text not null default 'researching' check (status in ('researching','preparing','applied','interview','offer','rejected','withdrawn')),
  next_step text,
  next_step_at timestamptz,
  tz text not null default 'Europe/Zurich',
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index opportunities_user_idx on public.opportunities (user_id, deadline_at);
create index applications_user_idx on public.applications (user_id, deadline_at);
create trigger opportunities_updated before update on public.opportunities for each row execute function public.set_updated_at();
create trigger applications_updated before update on public.applications for each row execute function public.set_updated_at();
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
create policy opportunities_owner on public.opportunities for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy applications_owner on public.applications for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.opportunities, public.applications from anon;
