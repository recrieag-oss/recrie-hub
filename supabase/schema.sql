-- RECRIE Kanban - Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  color text not null default '#6366f1',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.boards (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.lists (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text,
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  due_date timestamptz,
  cover_url text,
  archived boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.labels (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1'
);

create table public.card_labels (
  card_id uuid not null references public.cards(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (card_id, label_id)
);

create table public.card_members (
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (card_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_boards_workspace on public.boards(workspace_id);
create index idx_lists_board on public.lists(board_id);
create index idx_cards_list on public.cards(list_id);
create index idx_cards_archived on public.cards(archived) where archived = false;
create index idx_workspace_members_user on public.workspace_members(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.boards enable row level security;
alter table public.lists enable row level security;
alter table public.cards enable row level security;
alter table public.labels enable row level security;
alter table public.card_labels enable row level security;
alter table public.card_members enable row level security;

-- Profiles: users can read all profiles, update their own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Workspaces: members can read, admins/owners can update
create policy "Workspace members can view workspaces"
  on public.workspaces for select to authenticated
  using (
    owner_id = auth.uid() or
    exists (select 1 from public.workspace_members where workspace_id = id and user_id = auth.uid())
  );

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert to authenticated
  with check (owner_id = auth.uid());

create policy "Workspace owners can update"
  on public.workspaces for update to authenticated
  using (owner_id = auth.uid());

create policy "Workspace owners can delete"
  on public.workspaces for delete to authenticated
  using (owner_id = auth.uid());

-- Workspace members: viewable by workspace members
create policy "Workspace members can view members"
  on public.workspace_members for select to authenticated
  using (
    exists (select 1 from public.workspace_members wm where wm.workspace_id = workspace_id and wm.user_id = auth.uid())
    or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
  );

create policy "Workspace admins can manage members"
  on public.workspace_members for insert to authenticated
  with check (
    exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
    or exists (select 1 from public.workspace_members wm where wm.workspace_id = workspace_id and wm.user_id = auth.uid() and wm.role = 'admin')
  );

create policy "Workspace admins can remove members"
  on public.workspace_members for delete to authenticated
  using (
    exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
    or exists (select 1 from public.workspace_members wm where wm.workspace_id = workspace_id and wm.user_id = auth.uid() and wm.role = 'admin')
  );

-- Boards: accessible by workspace members
create policy "Boards viewable by workspace members"
  on public.boards for select to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      left join public.workspace_members wm on wm.workspace_id = w.id
      where w.id = workspace_id and (w.owner_id = auth.uid() or wm.user_id = auth.uid())
    )
  );

create policy "Workspace members can create boards"
  on public.boards for insert to authenticated
  with check (
    exists (
      select 1 from public.workspaces w
      left join public.workspace_members wm on wm.workspace_id = w.id
      where w.id = workspace_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

create policy "Workspace editors can update boards"
  on public.boards for update to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      left join public.workspace_members wm on wm.workspace_id = w.id
      where w.id = workspace_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

create policy "Workspace admins can delete boards"
  on public.boards for delete to authenticated
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );

-- Lists: same access as boards
create policy "Lists viewable by workspace members"
  on public.lists for select to authenticated
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where b.id = board_id and (w.owner_id = auth.uid() or wm.user_id = auth.uid())
    )
  );

create policy "Editors can manage lists"
  on public.lists for insert to authenticated
  with check (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where b.id = board_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

create policy "Editors can update lists"
  on public.lists for update to authenticated
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where b.id = board_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

create policy "Editors can delete lists"
  on public.lists for delete to authenticated
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where b.id = board_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

-- Cards: same access pattern
create policy "Cards viewable by workspace members"
  on public.cards for select to authenticated
  using (
    exists (
      select 1 from public.lists l
      join public.boards b on b.id = l.board_id
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where l.id = list_id and (w.owner_id = auth.uid() or wm.user_id = auth.uid())
    )
  );

create policy "Editors can create cards"
  on public.cards for insert to authenticated
  with check (
    exists (
      select 1 from public.lists l
      join public.boards b on b.id = l.board_id
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where l.id = list_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

create policy "Editors can update cards"
  on public.cards for update to authenticated
  using (
    exists (
      select 1 from public.lists l
      join public.boards b on b.id = l.board_id
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where l.id = list_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

create policy "Editors can delete cards"
  on public.cards for delete to authenticated
  using (
    exists (
      select 1 from public.lists l
      join public.boards b on b.id = l.board_id
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where l.id = list_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

-- Labels
create policy "Labels viewable by workspace members"
  on public.labels for select to authenticated
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where b.id = board_id and (w.owner_id = auth.uid() or wm.user_id = auth.uid())
    )
  );

create policy "Editors can manage labels"
  on public.labels for all to authenticated
  using (
    exists (
      select 1 from public.boards b
      join public.workspaces w on w.id = b.workspace_id
      left join public.workspace_members wm on wm.workspace_id = w.id
      where b.id = board_id and (w.owner_id = auth.uid() or (wm.user_id = auth.uid() and wm.role in ('admin', 'editor')))
    )
  );

-- Card labels and members: same as cards
create policy "Card labels viewable"
  on public.card_labels for select to authenticated using (true);

create policy "Card labels manageable by editors"
  on public.card_labels for all to authenticated using (true);

create policy "Card members viewable"
  on public.card_members for select to authenticated using (true);

create policy "Card members manageable by editors"
  on public.card_members for all to authenticated using (true);

-- ============================================
-- FUNCTIONS
-- ============================================

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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-add owner as workspace admin member
create or replace function public.handle_new_workspace()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'admin');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- Create default lists when a board is created
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

create or replace trigger on_board_created
  after insert on public.boards
  for each row execute function public.handle_new_board();

-- ============================================
-- REALTIME
-- ============================================

alter publication supabase_realtime add table public.cards;
alter publication supabase_realtime add table public.lists;
