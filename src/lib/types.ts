export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  color: string
  logo_url?: string | null
  owner_id: string
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  profiles?: Profile
}

export interface Board {
  id: string
  workspace_id: string
  name: string
  color: string
  position: number
  created_at: string
}

export interface List {
  id: string
  board_id: string
  name: string
  position: number
  color: string | null
  created_at: string
  cards?: Card[]
}

export interface Card {
  id: string
  list_id: string
  title: string
  description: string | null
  position: number
  due_date: string | null
  cover_url: string | null
  archived: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  label_ids?: string[]
  checklist?: ChecklistItem[]
  attachments?: Attachment[]
}

export interface Label {
  id: string
  board_id: string
  name: string
  color: string
}

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
}
