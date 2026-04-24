const CONFIG = {
  processing: { color: 'bg-accent', label: 'Processing', pulse: true },
  ready: { color: 'bg-success', label: 'Ready', pulse: false },
  failed: { color: 'bg-danger', label: 'Failed', pulse: false },
}

export default function ProcessingStatus({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.processing
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      <span className="font-mono text-[0.65rem] text-muted">{cfg.label}</span>
    </span>
  )
}
