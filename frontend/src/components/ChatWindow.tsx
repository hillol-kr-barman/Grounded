import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import type { Message } from '../types'

interface ChatWindowProps {
  messages: Message[]
  isStreaming: boolean
  error: string | null
  onSend: (text: string) => void
}

export default function ChatWindow({ messages, isStreaming, error, onSend }: ChatWindowProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    onSend(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-5 grid gap-5 content-start">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="size-12 rounded-xl bg-soft border border-border-strong flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-[0.88rem] text-muted m-0 max-w-xs">
              Ask anything about your documents. Every answer is grounded in your source material.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id ?? i} message={msg} />
        ))}

        {error && (
          <p className="text-danger text-[0.82rem] bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.2)] rounded-[5px] px-3 py-2 m-0">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-border bg-surface shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-background border border-border rounded-[5px] px-3 py-2.5 text-[0.88rem] text-text placeholder:text-[#6b7685] focus:border-accent-strong focus:outline-none transition-colors resize-none disabled:opacity-50"
            style={{ minHeight: '2.75rem', maxHeight: '8rem', overflowY: 'auto' }}
          />
          <button
            type="submit"
            className="btn shrink-0"
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#0a0c0d] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-1.5 rounded-full bg-[#0a0c0d] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-1.5 rounded-full bg-[#0a0c0d] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : (
              'Send'
            )}
          </button>
        </form>
        <p className="font-mono text-[0.65rem] text-[#6b7685] mt-1.5 m-0">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
