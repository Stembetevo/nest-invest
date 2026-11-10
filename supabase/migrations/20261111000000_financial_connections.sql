-- Bank accounts collected through Stripe Financial Connections, keyed to the Supabase auth user.

create table if not exists public.financial_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  latest_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_accounts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_account_id text not null,
  institution_name text,
  display_name text,
  last4 text,
  category text not null,
  subcategory text not null,
  status text not null,
  currency text,
  current_balance bigint,
  available_balance bigint,
  balance_as_of timestamptz,
  balance_refresh_status text,
  transaction_refresh_status text,
  transaction_refresh_id text,
  linked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, stripe_account_id)
);

create index if not exists financial_accounts_stripe_account_idx
  on public.financial_accounts (stripe_account_id);

create table if not exists public.financial_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_account_id text not null,
  stripe_transaction_id text not null,
  amount bigint not null,
  currency text not null,
  description text,
  status text not null,
  transacted_at timestamptz not null,
  synced_at timestamptz not null default now(),
  unique (user_id, stripe_transaction_id)
);

create index if not exists financial_transactions_user_transacted_idx
  on public.financial_transactions (user_id, transacted_at desc);

create table if not exists public.credit_assessments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  score integer check (score is null or (score >= 0 and score <= 100)),
  verdict text not null check (verdict in ('pending', 'insufficient', 'weak', 'thin', 'moderate', 'strong')),
  currency text,
  average_balance bigint,
  monthly_inflow bigint,
  monthly_outflow bigint,
  months_covered integer not null default 0,
  reasons jsonb not null,
  assessed_at timestamptz not null default now()
);

alter table public.financial_connections enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.credit_assessments enable row level security;

create policy "Users can view their linked bank accounts"
  on public.financial_accounts for select
  using (auth.uid() = user_id);

create policy "Users can view their bank transactions"
  on public.financial_transactions for select
  using (auth.uid() = user_id);

create policy "Users can view their credit assessment"
  on public.credit_assessments for select
  using (auth.uid() = user_id);

revoke all on public.financial_connections from anon, authenticated;
revoke insert, update, delete on public.financial_accounts from anon, authenticated;
revoke insert, update, delete on public.financial_transactions from anon, authenticated;
revoke insert, update, delete on public.credit_assessments from anon, authenticated;
