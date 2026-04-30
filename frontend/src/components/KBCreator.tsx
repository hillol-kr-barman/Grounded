import { useState } from 'react'

interface KBCreatorProps {
  onCreate: (name: string, description: string | null) => Promise<unknown>
  onClose: () => void
}

export default function KBCreator({ onCreate, onClose }: KBCreatorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      await onCreate(name.trim(), description.trim() || null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create knowledge base.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[1rem] font-semibold text-text m-0">New knowledge base</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b7685] hover:text-text bg-transparent border-0 cursor-pointer p-0 text-[1rem] font-sans transition-colors leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-[0.78rem] font-medium text-muted">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Company HR Policy"
              required
              autoFocus
              className="bg-background border border-border rounded-[5px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[#6b7685] focus:border-accent-strong focus:outline-none transition-colors"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-[0.78rem] font-medium text-muted">
              Description{' '}
              <span className="text-[#6b7685] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's in this knowledge base?"
              className="bg-background border border-border rounded-[5px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[#6b7685] focus:border-accent-strong focus:outline-none transition-colors"
            />
          </div>

          {error && <p className="text-danger text-[0.82rem] m-0">{error}</p>}

          <div className="flex gap-2 justify-end mt-1">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
