create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  code text,
  title text not null check (char_length(title) between 1 and 200),
  semester text,
  ects numeric(4,1) check (ects is null or ects >= 0),
  grade numeric(3,2) check (grade is null or (grade >= 1 and grade <= 6)),
  color text not null default 'slate',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('assessment','deadline','event','study_block','task')),
  assessment_type text check (assessment_type is null or assessment_type in ('assignment','exam','presentation','group_work','paper','other')),
  title text not null check (char_length(title) between 1 and 300),
  course_id uuid references public.courses(id) on delete set null,
  due_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  tz text not null default 'Europe/Zurich',
  weight_pct numeric(5,2) check (weight_pct is null or (weight_pct >= 0 and weight_pct <= 100)),
  est_hours numeric(6,1) check (est_hours is null or est_hours >= 0),
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  notes text,
  source text not null default 'manual',
  source_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_user_idx on public.courses (user_id);
create index items_user_due_idx on public.items (user_id, due_at);
create index items_course_idx on public.items (course_id);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create trigger courses_updated before update on public.courses for each row execute function public.set_updated_at();
create trigger items_updated before update on public.items for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
alter table public.items enable row level security;

create policy courses_owner on public.courses for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy items_owner on public.items for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.courses, public.items from anon;
