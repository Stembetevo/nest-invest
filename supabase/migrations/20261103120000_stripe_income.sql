create table if not exists public.stripe_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_account_id text not null unique,
  access_token_encrypted text not null,
  stripe_publishable_key text,
  livemode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_account_id text not null,
  stripe_transaction_id text not null,
  transaction_type text not null,
  amount bigint not null,
  fee bigint not null,
  net bigint not null,
  currency text not null,
  status text not null,
  available_on timestamptz not null,
  stripe_created_at timestamptz not null,
  description text,
  source_id text,
  raw jsonb not null,
  synced_at timestamptz not null default now(),
  unique (user_id, stripe_transaction_id)
);

create index if not exists stripe_transactions_user_created_idx
  on public.stripe_transactions (user_id, stripe_created_at desc);

alter table public.stripe_connections enable row level security;
alter table public.stripe_transactions enable row level security;

create policy "Users can view their Stripe transaction history"
  on public.stripe_transactions for select
  using (auth.uid() = user_id);

revoke all on public.stripe_connections from anon, authenticated;
revoke insert, update, delete on public.stripe_transactions from anon, authenticated;
