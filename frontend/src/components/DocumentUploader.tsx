import { useRef, useState } from 'react'
import { api } from '../lib/api'
import type { UploadEntry } from '../types'

const ACCEPTED_SINGLE = '.pdf,.docx,.txt,.md,.csv,.xlsx,.zip'
const SUPPORTED_EXTS = new Set(['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx'])
const CONCURRENCY = 4

async function runConcurrent(tasks: (() => Promise<void>)[], concurrency: number): Promise<void> {
  let i = 0
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < tasks.length) {
      const task = tasks[i++]
      await task()
    }
  })
  await Promise.all(workers)
}

interface DocumentUploaderProps {
  kbId: string
  token: string
}

export default function DocumentUploader({ kbId, token }: DocumentUploaderProps) {
  const [tab, setTab] = useState<'file' | 'folder' | 'url'>('file')
  const [url, setUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadEntry[]>([])
  const [folderProgress, setFolderProgress] = useState<{ done: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  function upsertUpload(id: string, patch: Partial<UploadEntry>) {
    setUploads((prev) => {
      const exists = prev.find((u) => u.id === id)
      if (exists) return prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
      return [...prev, { id, name: '', status: 'uploading', ...patch }]
    })
  }

  async function handleFile(file: File) {
    const id = `${file.name}-${Date.now()}`
    upsertUpload(id, { name: file.name, status: 'uploading' })
    try {
      await api.uploadFile(token, kbId, file)
      upsertUpload(id, { status: 'processing' })
    } catch (e) {
      upsertUpload(id, { status: 'error', error: e instanceof Error ? e.message : 'Upload failed.' })
    }
  }

  function handleFiles(files: File[]) {
    for (const f of files) handleFile(f)
  }

  async function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const allFiles = [...(e.target.files ?? [])]
    const supported = allFiles.filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return SUPPORTED_EXTS.has(ext)
    })

    if (supported.length === 0) return
    setFolderProgress({ done: 0, total: supported.length })

    const tasks = supported.map((file) => async () => {
      await handleFile(file)
      setFolderProgress((p) => p && { ...p, done: p.done + 1 })
    })

    await runConcurrent(tasks, CONCURRENCY)
    setFolderProgress(null)
    if (folderInputRef.current) folderInputRef.current.value = ''
  }

  async function handleURLSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    const id = `url-${Date.now()}`
    upsertUpload(id, { name: trimmed, status: 'uploading' })
    try {
      await api.ingestURL(token, kbId, trimmed)
      upsertUpload(id, { status: 'processing' })
      setUrl('')
    } catch (e) {
      upsertUpload(id, { status: 'error', error: e instanceof Error ? e.message : 'Ingest failed.' })
    }
  }

  const tabs: ('file' | 'folder' | 'url')[] = ['file', 'folder', 'url']

  return (
    <div className="border-b border-border bg-background-soft px-6 py-4 shrink-0">
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-[0.78rem] rounded-sm font-medium border transition-colors cursor-pointer font-sans capitalize ${
              tab === t
                ? 'bg-soft border-border-strong text-accent'
                : 'bg-transparent border-transparent text-muted hover:text-text'
            }`}
          >
            {t === 'file' ? 'Upload file' : t === 'folder' ? 'Upload folder' : 'From URL'}
          </button>
        ))}
      </div>

      {tab === 'file' && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-accent bg-soft' : 'border-border hover:border-border-strong'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles([...e.dataTransfer.files])
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_SINGLE}
            multiple
            className="hidden"
            onChange={(e) => handleFiles([...(e.target.files ?? [])])}
          />
          <p className="text-[0.85rem] text-muted m-0">
            Drop files here or <span className="text-accent font-medium">click to browse</span>
          </p>
          <p className="text-[0.72rem] text-[#6b7685] mt-1.5 m-0">
            PDF, DOCX, TXT, MD, CSV, XLSX, ZIP · Multiple files supported
          </p>
        </div>
      )}

      {tab === 'folder' && (
        <div>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-border-strong"
            onClick={() => folderInputRef.current?.click()}
          >
            <input
              ref={folderInputRef}
              type="file"
              {...{ webkitdirectory: '' }}
              multiple
              className="hidden"
              onChange={handleFolderSelect}
            />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2"
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[0.85rem] text-muted m-0">
              Click to select a <span className="text-accent font-medium">folder</span>
            </p>
            <p className="text-[0.72rem] text-[#6b7685] mt-1.5 m-0">
              All supported files inside will be ingested · PDF, DOCX, TXT, MD, CSV, XLSX
            </p>
          </div>

          {folderProgress && (
            <div className="mt-3 bg-surface border border-border rounded-[5px] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.78rem] text-text font-medium">Uploading folder…</span>
                <span className="font-mono text-[0.72rem] text-muted">
                  {folderProgress.done} / {folderProgress.total}
                </span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${(folderProgress.done / folderProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'url' && (
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

      {uploads.length > 0 && (
        <div className="mt-3 grid gap-1.5 max-h-40 overflow-y-auto">
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
