export default function Footer() {
  return (
    <footer className="border-t border-border shrink-0">
      <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <p className="text-[0.72rem] text-[#6b7685] m-0">
          &copy; {new Date().getFullYear()} Hillol Barman · Grounded
        </p>
        <p className="font-mono text-[0.65rem] text-[#6b7685] m-0">
          RAG · FastAPI · React · Supabase · pgvector
        </p>
      </div>
    </footer>
  )
}
