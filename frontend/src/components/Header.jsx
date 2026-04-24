export default function Header({ session, onSignOut }) {
  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between h-14 px-6 border-b border-border bg-[rgba(13,15,14,0.88)] backdrop-blur-[12px] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="size-7 rounded-[6px] bg-accent flex items-center justify-center flex-shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0a0c0d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <span className="text-text text-[0.95rem] font-semibold tracking-[-0.01em]">Grounded</span>
        <span className="font-mono text-[0.6rem] text-[#6b7685] border border-border rounded px-1.5 py-0.5">
          beta
        </span>
      </div>

      {/* Auth chip */}
      {session && (
        <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1">
          <span className="size-[7px] rounded-full bg-success flex-shrink-0" />
          <span className="font-mono text-[0.72rem] text-muted max-w-[14rem] truncate">
            {session.user.email}
          </span>
          <button
            type="button"
            onClick={onSignOut}
            className="text-[0.72rem] text-[#6b7685] hover:text-accent transition-colors bg-transparent border-0 cursor-pointer p-0 ml-1 font-sans"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
