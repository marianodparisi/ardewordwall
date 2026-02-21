export interface Session {
  id: string
  question: string
  is_active: boolean
  created_at: string
}

export interface Response {
  id: string
  session_id: string
  word: string
  emoji: string | null
  anonymous_id: string
  author_name: string | null
  created_at: string
}
