import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  function switchMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setInfo('Check your email to confirm your account, then sign in.')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onAuth(data.session)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="size-9 rounded-[8px] bg-accent flex items-center justify-center flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0c0d"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-text text-[1.1rem] font-semibold tracking-[-0.01em]">Grounded</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-7">
          <h1 className="text-[1.05rem] font-bold text-text mb-1">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-[0.82rem] text-muted mb-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-accent font-medium bg-transparent border-0 cursor-pointer p-0 font-sans text-[0.82rem]"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-[0.78rem] font-medium text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-background border border-border rounded-[5px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[#6b7685] focus:border-accent-strong focus:outline-none transition-colors"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-[0.78rem] font-medium text-muted">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background border border-border rounded-[5px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[#6b7685] focus:border-accent-strong focus:outline-none transition-colors"
              />
            </div>

            {error && <p className="text-danger text-[0.82rem] m-0">{error}</p>}
            {info && <p className="text-success text-[0.82rem] m-0">{info}</p>}

            <button type="submit" className="btn w-full mt-1" disabled={isLoading}>
              {isLoading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[0.72rem] text-[#6b7685] mt-6">
          Portfolio project · Hillol Barman
        </p>
      </div>
    </div>
  )
}
