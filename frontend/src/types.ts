export interface KnowledgeBase {
  id: string
  name: string
  description?: string | null
}

export interface Source {
  name?: string
  url?: string
}

export interface Message {
  id?: number
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  streaming?: boolean
}

export interface UploadEntry {
  id: string
  name: string
  status: 'uploading' | 'processing' | 'error' | 'done'
  error?: string
}
