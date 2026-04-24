import { useRef, useState } from 'react'
import { api } from '../lib/api'

const ACCEPTED = '.pdf,.docx,.txt,.md,.csv,.xlsx'

export default function DocumentUploader({ kbId, token }) {
  const [tab, setTab] = useState('file')
  const [url, setUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState([])
  const inputRef = useRef(null)

  function addUpload(name, status, error = null) {
    setUploads((prev) => [...prev, { name, status, error, id: Date.now() + Math.random() }])
  }

  function updateUpload(name, status, error = null) {
    setUploads((prev) =>
      prev.map((u) => (u.name === name ? { ...u, status, error } : u)),
    )
  }

  async function handleFile(file) {
    addUpload(file.name, 'uploading')
    try {
      await api.uploadFile(token, kbId, file)
      updateUpload(file.name, 'processing')
    } catch (e) {
      updateUpload(file.name, 'error', e.message)
    }
  }

  function handleFiles(files) {
    for (const f of files) handleFile(f)
  }

  async function handleURLSubmit(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    addUpload(trimmed, 'uploading')
    try {
      await api.ingestURL(token, kbId, trimmed)
      updateUpload(trimmed, 'processing')
      setUrl('')
    } catch (e) {
      updateUpload(trimmed, 'error', e.message)
    }
  }

  return (
    <div className="border-b border-border bg-background-soft px-6 py-4 shrink-0">
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {['file', 'url'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-[0.78rem] rounded-[4px] font-medium border transition-colors cursor-pointer font-sans ${
              tab === t
                ? 'bg-soft border-border-strong text-accent'
                : 'bg-transparent border-transparent text-muted hover:text-text'
            }`}
          >
            {t === 'file' ? 'Upload file' : 'From URL'}
          </button>
        ))}
      </div>

      {tab === 'file' ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-accent bg-soft'
              : 'border-border hover:border-[rgba(245,158,11,0.3)]'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles([...e.dataTransfer.files])
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={(e) => handleFiles([...e.target.files])}
          />
          <p className="text-[0.85rem] text-muted m-0">
            Drop files here or{' '}
            <span className="text-accent font-medium">click to browse</span>
          </p>
          <p className="text-[0.72rem] text-[#6b7685] mt-1.5 m-0">
            PDF, DOCX, TXT, MD, CSV, XLSX · Max 20 MB
          </p>
        </div>
      ) : (
        <form onSubmit={handleURLSubmit} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            required
            className="flex-1 bg-background border border-border rounded-[5px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[#6b7685] focus:border-accent-strong focus:outline-none transition-colors"
          />
          <button type="submit" className="btn" disabled={!url.trim()}>
            Ingest
          </button>
        </form>
      )}

      {/* Upload log */}
      {uploads.length > 0 && (
        <div className="mt-3 grid gap-1.5">
          {uploads.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-[5px]"
            >
              <span
                className={`size-2 rounded-full shrink-0 ${
                  u.status === 'uploading'
                    ? 'bg-[#6b7685] animate-pulse'
                    : u.status === 'processing'
                      ? 'bg-accent animate-pulse'
                      : u.status === 'error'
                        ? 'bg-danger'
                        : 'bg-success'
                }`}
              />
              <span className="font-mono text-[0.72rem] text-muted truncate flex-1">{u.name}</span>
              <span
                className={`font-mono text-[0.65rem] shrink-0 ${u.status === 'error' ? 'text-danger' : 'text-[#6b7685]'}`}
              >
                {u.status === 'uploading'
                  ? 'uploading…'
                  : u.status === 'processing'
                    ? 'processing…'
                    : u.status === 'error'
                      ? (u.error ?? 'error')
                      : 'done'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
