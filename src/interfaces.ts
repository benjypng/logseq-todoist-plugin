export interface TodoistSyncResponse {
  full_sync: boolean
  full_sync_date_utc: string
  items: TodoistSyncItem[]
  sync_token: string
  temp_id_mapping: Record<string, string>
}

export interface TodoistSyncItem {
  id: string
  user_id: string
  project_id: string
  content: string
  description: string
  priority: number
  due: TodoistDue | null
  parent_id: string | null
  section_id: string | null
  child_order: number
  day_order: number
  collapsed: boolean // Note: JSON says "is_collapsed", checking key match below
  is_collapsed: boolean
  labels: string[]
  added_at: string
  added_by_uid: string
  assigned_by_uid: string | null
  responsible_uid: string | null
  checked: boolean
  is_deleted: boolean
  completed_at: string | null
  completed_by_uid: string | null
  deadline: string | null
  duration: TodoistDuration | null
  note_count: number
  updated_at: string
}

// Included for type safety, though null in your example
export interface TodoistDue {
  date: string
  string: string
  lang: string
  is_recurring: boolean
  timezone?: string | null
}

// Included for type safety, though null in your example
export interface TodoistDuration {
  amount: number
  unit: 'minute' | 'hour' // Common Todoist units
}

export interface TodoistSendResponse {
  full_sync: boolean
  full_sync_date_utc: string
  sync_status: Record<string, string>
  sync_token: string
  temp_id_mapping: Record<string, string>
}

export interface TodoistUserSyncItem {
  user: {
    inbox_project_id: string
  }
}

export interface SyncLock {
  isInternalSync: boolean
}
