import { supabase } from './supabase'
import type { KnowledgeBase, Source } from '../types'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

async function fetchWithToken(path: string, options: RequestOptions = {}, token?: string | null): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

async function authFetch(path: string, options: RequestOptions = {}, token?: string | null): Promise<Response> {
  let res = await fetchWithToken(path, options, token)

  if (res.status === 401) {
    const { data } = await supabase.auth.refreshSession()
    if (data.session) {
      res = await fetchWithToken(path, options, data.session.access_token)
    }
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res
}

export interface CreateKBPayload {
  name: string
  description: string | null
}

export interface ChatStreamPayload {
  message: string
  knowledge_base_id: string
  conversation_history: { role: string; content: string }[]
}

export interface ChatStreamChunk {
  token?: string
  done?: boolean
  sources?: Source[]
}

export const api = {
  async listKBs(token: string): Promise<KnowledgeBase[]> {
    return (await authFetch('/knowledge-bases', {}, token)).json() as Promise<KnowledgeBase[]>
  },

  async createKB(token: string, data: CreateKBPayload): Promise<KnowledgeBase> {
    return (
      await authFetch('/knowledge-bases', { method: 'POST', body: JSON.stringify(data) }, token)
    ).json() as Promise<KnowledgeBase>
  },

  async deleteKB(token: string, id: string): Promise<void> {
    await authFetch(`/knowledge-bases/${id}`, { method: 'DELETE' }, token)
  },

  async listDocuments(token: string, kbId: string): Promise<unknown[]> {
    return (await authFetch(`/knowledge-bases/${kbId}/documents`, {}, token)).json() as Promise<unknown[]>
  },

  async uploadFile(token: string, kbId: string, file: File): Promise<unknown> {
    const form = new FormData()
    form.append('file', file)

    let res = await fetch(`${API_BASE}/knowledge-bases/${kbId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })

    if (res.status === 401) {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) {
        res = await fetch(`${API_BASE}/knowledge-bases/${kbId}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          body: form,
        })
      }
    }

    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async ingestURL(token: string, kbId: string, url: string): Promise<unknown> {
    return (
      await authFetch(
        `/knowledge-bases/${kbId}/url`,
        { method: 'POST', body: JSON.stringify({ url }) },
        token,
      )
    ).json()
  },

  chatStream(token: string, payload: ChatStreamPayload): Promise<Response> {
    return fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
}
