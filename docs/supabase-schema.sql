-- MegaGen Idle: accounts and cloud saves (0.67 plan, used by 0.68).
-- Paste into the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to read: it creates two tables, locks each row to its owner with
-- row-level security, and adds a function that deletes the caller's account.

-- Player names, shown later on leaderboards. One row per account.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null
    check (char_length(username) between 3 and 20 and username ~ '^[A-Za-z0-9_]+$'),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles are readable by everyone" on public.profiles
  for select using (true);
create policy "players create their own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "players rename their own profile" on public.profiles
  for update using ((select auth.uid()) = id);

-- Cloud saves: one row per account and slot ("auto" is the automatic save).
-- data is the export file text the game already uses for Export/Import.
create table public.saves (
  user_id uuid not null references auth.users on delete cascade,
  slot text not null check (char_length(slot) between 1 and 32),
  version int not null,
  saved_at timestamptz not null,
  energy double precision not null,
  completion real not null check (completion between 0 and 1),
  data text not null check (octet_length(data) <= 1000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);
alter table public.saves enable row level security;
create policy "players read their own saves" on public.saves
  for select using ((select auth.uid()) = user_id);
create policy "players add their own saves" on public.saves
  for insert with check ((select auth.uid()) = user_id);
create policy "players overwrite their own saves" on public.saves
  for update using ((select auth.uid()) = user_id);
create policy "players delete their own saves" on public.saves
  for delete using ((select auth.uid()) = user_id);

-- "Delete my account" in the game: removes the login, the profile and every
-- save (they cascade). Runs as the caller only; nobody can delete others.
create function public.delete_my_account() returns void
  language sql security definer set search_path = ''
  as $$ delete from auth.users where id = (select auth.uid()); $$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
