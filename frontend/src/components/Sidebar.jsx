import { useState } from 'react'

export default function Sidebar({ kbs, selectedKB, isLoading, onSelectKB, onNewKB, onDeleteKB }) {
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(e, kb) {
    e.stopPropagation()
    if (!window.confirm(`Delete "${kb.name}"? This cannot be undone.`)) return
    setDeletingId(kb.id)
    try {
      await onDeleteKB(kb.id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
      {/* New KB button */}
      <div className="p-3 border-b border-border">
        <button type="button" className="btn w-full text-[0.8rem]" onClick={onNewKB}>
          + New knowledge base
        </button>
      </div>

      {/* KB list */}
      <div className="flex-1 overflow-y-auto p-2 grid gap-0.5 content-start">
        {isLoading && (
          <p className="text-[0.78rem] text-muted text-center py-6 m-0">Loading…</p>
        )}
        {!isLoading && kbs.length === 0 && (
          <p className="text-[0.78rem] text-[#6b7685] text-center py-8 m-0 px-3">
            No knowledge bases yet.
            <br />
            Create one to get started.
          </p>
        )}
        {kbs.map((kb) => {
          const isSelected = selectedKB?.id === kb.id
          return (
            <button
              key={kb.id}
              type="button"
              onClick={() => onSelectKB(kb)}
              className={`w-full text-left px-3 py-2.5 rounded-[5px] group flex items-start justify-between gap-2 transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-soft border-border-strong text-text'
                  : 'bg-transparent border-transparent text-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-text'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[0.82rem] font-medium m-0 truncate ${isSelected ? 'text-text' : ''}`}
                >
                  {kb.name}
                </p>
                {kb.description && (
                  <p className="text-[0.7rem] text-[#6b7685] m-0 mt-0.5 truncate">
                    {kb.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(e, kb)}
                disabled={deletingId === kb.id}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-[#6b7685] hover:text-danger bg-transparent border-0 cursor-pointer p-0 text-[0.75rem] transition-opacity font-sans disabled:opacity-30 leading-none mt-0.5"
                title="Delete knowledge base"
              >
                {deletingId === kb.id ? '…' : '✕'}
              </button>
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div className="p-3 border-t border-border">
        <p className="font-mono text-[0.62rem] text-[#6b7685] m-0 text-center">
          {kbs.length} knowledge base{kbs.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  )
}
