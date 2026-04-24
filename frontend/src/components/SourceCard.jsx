function DocIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent shrink-0"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function CardInner({ source }) {
  const isURL = Boolean(source.url?.startsWith('http'))
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border rounded-[5px] hover:border-accent transition-colors">
      {isURL ? <LinkIcon /> : <DocIcon />}
      <span className="font-mono text-[0.68rem] text-muted truncate max-w-[180px]">
        {source.name || 'Source'}
      </span>
    </div>
  )
}

export default function SourceCard({ source }) {
  if (source.url?.startsWith('http')) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="no-underline hover:no-underline"
      >
        <CardInner source={source} />
      </a>
    )
  }
  return <CardInner source={source} />
}
