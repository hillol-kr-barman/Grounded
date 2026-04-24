const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function authFetch(path, options = {}, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res
}

export const api = {
  async listKBs(token) {
    return (await authFetch('/knowledge-bases', {}, token)).json()
  },

  async createKB(token, data) {
    return (
      await authFetch('/knowledge-bases', { method: 'POST', body: JSON.stringify(data) }, token)
    ).json()
  },

  async deleteKB(token, id) {
    await authFetch(`/knowledge-bases/${id}`, { method: 'DELETE' }, token)
  },

  async listDocuments(token, kbId) {
    return (await authFetch(`/knowledge-bases/${kbId}/documents`, {}, token)).json()
  },

  async uploadFile(token, kbId, file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/knowledge-bases/${kbId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  async ingestURL(token, kbId, url) {
    return (
      await authFetch(
        `/knowledge-bases/${kbId}/url`,
        { method: 'POST', body: JSON.stringify({ url }) },
        token,
      )
    ).json()
  },

  chatStream(token, payload) {
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
