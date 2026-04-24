import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export function useChat(token) {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(
    async (userText, kbId) => {
      setMessages((prev) => [...prev, { role: 'user', content: userText }])
      setIsStreaming(true)
      setError(null)

      const assistantId = Date.now()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', sources: [], streaming: true },
      ])

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }))
        const res = await api.chatStream(token, {
          message: userText,
          knowledge_base_id: kbId,
          conversation_history: history,
        })

        if (!res.ok) throw new Error(await res.text())

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = JSON.parse(line.slice(6))
            if (data.token) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + data.token } : m,
                ),
              )
            } else if (data.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, sources: data.sources || [], streaming: false }
                    : m,
                ),
              )
            }
          }
        }
      } catch (e) {
        setError(e.message)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Something went wrong. Please try again.', streaming: false }
              : m,
          ),
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [token, messages],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isStreaming, error, sendMessage, clearChat }
}
