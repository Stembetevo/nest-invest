-- Creator income: profiles, onboarding progress, income sources, and income entries.
-- Every table is protected by RLS so a signed-in user can only see and change their own rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null default 'creator' check (account_type in ('creator')),
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  creator_type text check (
    creator_type is null
    or creator_type in ('filmmaker', 'youtuber', 'musician', 'designer', 'other')
  ),
  onboarding_step smallint not null default 1 check (onboarding_step between 1 and 3),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.onboarding_step is
  'First onboarding step the user has not finished yet (1 = profile, 2 = income sources, 3 = first entry).';

create table public.income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source text not null check (source in ('brand_deals', 'youtube', 'mpesa', 'clients', 'other')),
  created_at timestamptz not null default now(),
  unique (user_id, source)
);

create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount_kes numeric(12, 2) not null check (amount_kes > 0 and amount_kes <= 100000000),
  source text not null check (source in ('brand_deals', 'youtube', 'mpesa', 'clients', 'other')),
  received_on date not null check (received_on >= date '2000-01-01'),
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now()
);

create index income_entries_user_received_idx
  on public.income_entries (user_id, received_on desc, created_at desc);

-- Keep profiles.updated_at current.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every new auth user gets a Creator profile. account_type comes from the column default,
-- never from client-supplied signup metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.income_sources enable row level security;
alter table public.income_entries enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users may edit their name, creator type, and onboarding progress, but not account_type.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, creator_type, onboarding_step, onboarding_completed_at)
  on public.profiles to authenticated;

create policy "Users can read their own income sources"
  on public.income_sources for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own income sources"
  on public.income_sources for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own income sources"
  on public.income_sources for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.income_sources from anon;
grant select, insert, delete on public.income_sources to authenticated;

create policy "Users can read their own income entries"
  on public.income_entries for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own income entries"
  on public.income_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own income entries"
  on public.income_entries for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own income entries"
  on public.income_entries for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.income_entries from anon;
grant select, insert, update, delete on public.income_entries to authenticated;
