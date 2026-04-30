import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { useKnowledgeBase } from './hooks/useKnowledgeBase'
import { useChat } from './hooks/useChat'
import AuthPage from './pages/AuthPage'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import KBCreator from './components/KBCreator'
import DocumentUploader from './components/DocumentUploader'
import ChatWindow from './components/ChatWindow'
import type { KnowledgeBase } from './types'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [showKBCreator, setShowKBCreator] = useState(false)
  const [showUploader, setShowUploader] = useState(false)

  const token = session?.access_token ?? null

  const { kbs, selectedKB, setSelectedKB, isLoading: kbLoading, loadKBs, createKB, deleteKB } =
    useKnowledgeBase(token)

  const { messages, isStreaming, error: chatError, sendMessage, clearChat } = useChat(token)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoadingSession(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoadingSession(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (token) loadKBs()
  }, [token, loadKBs])

  function handleSelectKB(kb: KnowledgeBase) {
    setSelectedKB(kb)
    clearChat()
    setShowUploader(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-mono text-[0.82rem] text-muted">Loading…</span>
      </div>
    )
  }

  if (!session) {
    return <AuthPage onAuth={setSession} />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header session={session} onSignOut={handleSignOut} />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 3.5rem - 2.5rem)' }}>
        <Sidebar
          kbs={kbs}
          selectedKB={selectedKB}
          isLoading={kbLoading}
          onSelectKB={handleSelectKB}
          onNewKB={() => setShowKBCreator(true)}
          onDeleteKB={deleteKB}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedKB ? (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface shrink-0">
                <div>
                  <h2 className="text-[0.9rem] font-semibold text-text m-0 leading-tight">
                    {selectedKB.name}
                  </h2>
                  {selectedKB.description && (
                    <p className="text-[0.72rem] text-muted m-0 mt-0.5">{selectedKB.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploader((v) => !v)}
                  className="btn btn-ghost text-[0.78rem]"
                >
                  {showUploader ? 'Close uploader' : 'Add documents'}
                </button>
              </div>

              {showUploader && token && (
                <DocumentUploader kbId={selectedKB.id} token={token} />
              )}

              <ChatWindow
                messages={messages}
                isStreaming={isStreaming}
                error={chatError}
                onSend={(text) => sendMessage(text, selectedKB.id)}
              />
            </>
          ) : (
            <WelcomeState kbCount={kbs.length} onNewKB={() => setShowKBCreator(true)} />
          )}
        </main>
      </div>

      <Footer />

      {showKBCreator && (
        <KBCreator onCreate={createKB} onClose={() => setShowKBCreator(false)} />
      )}
    </div>
  )
}

interface WelcomeStateProps {
  kbCount: number
  onNewKB: () => void
}

function WelcomeState({ kbCount, onNewKB }: WelcomeStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6">
      <div className="size-16 rounded-2xl bg-soft border border-border-strong flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
      <div>
        <h2 className="text-[1.15rem] font-bold text-text mb-2">
          {kbCount === 0 ? 'Create your first knowledge base' : 'Select a knowledge base'}
        </h2>
        <p className="text-[0.88rem] text-muted max-w-xs m-0">
          {kbCount === 0
            ? 'Upload documents and start chatting with your content. Every answer is grounded in your source material.'
            : 'Choose a knowledge base from the sidebar to start chatting, or create a new one.'}
        </p>
      </div>
      {kbCount === 0 && (
        <button type="button" className="btn" onClick={onNewKB}>
          Create knowledge base
        </button>
      )}
    </div>
  )
}
