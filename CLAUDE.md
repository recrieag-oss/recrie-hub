@AGENTS.md

## Project: RECRIE Kanban

Plataforma de gestão de produção de conteúdo estilo Kanban para a RECRIE.

### Stack
- Next.js 16 + TypeScript + Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, Realtime)
- @dnd-kit/core + @dnd-kit/sortable (drag-and-drop)
- Deploy: Vercel

### Setup
1. Copie `.env.local.example` para `.env.local` e preencha com credenciais do Supabase
2. Execute `supabase/schema.sql` no SQL Editor do Supabase
3. `npm run dev`

### Structure
- `src/app/` — App Router pages (login, dashboard, board/[id])
- `src/components/board/` — Kanban components (CardItem, KanbanList, CardModal)
- `src/lib/supabase/` — Supabase client (browser + server + middleware)
- `src/lib/types.ts` — TypeScript interfaces
- `supabase/schema.sql` — Database schema with RLS policies
