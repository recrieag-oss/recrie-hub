-- ============================================================
-- RECRIE HUB — Schema Unificado
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- AUTH: Profiles (compartilhado por todos os módulos)
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- KANBAN: Workspaces, Boards, Lists, Cards
-- ============================================================

create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  color text not null default '#6366f1',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lists (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  due_date timestamptz,
  cover_url text,
  archived boolean not null default false,
  label_ids text[] default '{}',
  checklist jsonb default '[]',
  attachments jsonb default '[]',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.labels (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1'
);

-- Auto-create default lists on new board
create or replace function public.handle_new_board()
returns trigger as $$
begin
  insert into public.lists (board_id, name, position) values
    (new.id, 'Ideias', 0),
    (new.id, 'Em Produção', 1),
    (new.id, 'Produzindo', 2),
    (new.id, 'Programado', 3),
    (new.id, 'Postado', 4),
    (new.id, 'Finalizado', 5);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_board_created on public.boards;
create trigger on_board_created
  after insert on public.boards
  for each row execute function public.handle_new_board();

-- ============================================================
-- FINANCEIRO: Monthly data + Goals
-- ============================================================

create table if not exists public.fin_months (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  year int not null,
  month int not null,
  data jsonb not null default '{"income":[],"expenses":[]}',
  updated_at timestamptz not null default now(),
  unique(user_id, year, month)
);

create table if not exists public.fin_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AGÊNCIA: Categories, References, Prompts
-- ============================================================

create table if not exists public.ag_categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text not null default '#ec4899',
  icon text default 'folder',
  created_at timestamptz not null default now()
);

create table if not exists public.ag_references (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.ag_categories(id) on delete set null,
  title text not null,
  description text,
  image_url text not null default '',
  thumbnail_url text not null default '',
  tags text[],
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ag_prompts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.ag_categories(id) on delete set null,
  title text not null,
  content text not null default '',
  tags text[],
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROPOSTAS: Clients + Proposals
-- ============================================================

create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  contact text default '',
  email text default '',
  type text not null default 'pf' check (type in ('pj', 'pf')),
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text default '',
  items jsonb not null default '[]',
  status text not null default 'rascunho' check (status in ('rascunho','enviada','negociacao','aprovada','recusada')),
  total numeric(12,2) not null default 0,
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  type text not null default 'created',
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_boards_workspace on public.boards(workspace_id);
create index if not exists idx_lists_board on public.lists(board_id);
create index if not exists idx_cards_list on public.cards(list_id);
create index if not exists idx_fin_months_user on public.fin_months(user_id, year, month);
create index if not exists idx_ag_refs_user on public.ag_references(user_id);
create index if not exists idx_ag_prompts_user on public.ag_prompts(user_id);
create index if not exists idx_clients_user on public.clients(user_id);
create index if not exists idx_proposals_user on public.proposals(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (todas as tabelas)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.boards enable row level security;
alter table public.lists enable row level security;
alter table public.cards enable row level security;
alter table public.labels enable row level security;
alter table public.fin_months enable row level security;
alter table public.fin_goals enable row level security;
alter table public.ag_categories enable row level security;
alter table public.ag_references enable row level security;
alter table public.ag_prompts enable row level security;
alter table public.clients enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_activities enable row level security;

-- Profiles
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id);

-- Workspaces: owner only
create policy "workspaces_all" on public.workspaces for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Boards: via workspace owner
create policy "boards_all" on public.boards for all to authenticated
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

-- Lists: via board > workspace owner
create policy "lists_all" on public.lists for all to authenticated
  using (exists (select 1 from public.boards b join public.workspaces w on w.id = b.workspace_id where b.id = board_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards b join public.workspaces w on w.id = b.workspace_id where b.id = board_id and w.owner_id = auth.uid()));

-- Cards: via list > board > workspace owner
create policy "cards_all" on public.cards for all to authenticated
  using (exists (select 1 from public.lists l join public.boards b on b.id = l.board_id join public.workspaces w on w.id = b.workspace_id where l.id = list_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.lists l join public.boards b on b.id = l.board_id join public.workspaces w on w.id = b.workspace_id where l.id = list_id and w.owner_id = auth.uid()));

-- Labels: via board > workspace owner
create policy "labels_all" on public.labels for all to authenticated
  using (exists (select 1 from public.boards b join public.workspaces w on w.id = b.workspace_id where b.id = board_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards b join public.workspaces w on w.id = b.workspace_id where b.id = board_id and w.owner_id = auth.uid()));

-- Financeiro: user_id match
create policy "fin_months_all" on public.fin_months for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "fin_goals_all" on public.fin_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Agência: user_id match
create policy "ag_categories_all" on public.ag_categories for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ag_references_all" on public.ag_references for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ag_prompts_all" on public.ag_prompts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Propostas: user_id match
create policy "clients_all" on public.clients for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "proposals_all" on public.proposals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "activities_all" on public.proposal_activities for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- STORAGE (para imagens de referência e capas)
-- ============================================================

insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true) on conflict do nothing;

create policy "uploads_select" on storage.objects for select using (bucket_id = 'uploads');
create policy "uploads_insert" on storage.objects for insert to authenticated with check (bucket_id = 'uploads');
create policy "uploads_delete" on storage.objects for delete to authenticated using (bucket_id = 'uploads');
