create extension if not exists "pgcrypto";

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  preview_text text not null,
  result jsonb not null,
  conversation_type text not null,
  sentiment_label text not null,
  sentiment_score integer not null check (sentiment_score >= 0 and sentiment_score <= 100)
);

create table if not exists public.analysis_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.analyses enable row level security;
alter table public.analysis_rate_limits enable row level security;

create policy if not exists "Users can read own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

create policy if not exists "Users can read own rate limit rows"
  on public.analysis_rate_limits for select
  using (auth.uid() = user_id);

