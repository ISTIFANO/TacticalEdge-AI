import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_CREDENTIALS, useAuth } from '../../context/AuthContext'
import { BRAND } from '../../lib/brand'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/coach'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-400">Sign in to your {BRAND} coach account</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="text-sm text-slate-400">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch"
            placeholder="you@club.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm text-slate-400">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-slate-600" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-pitch hover:underline">Forgot password?</Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-pitch py-2.5 font-semibold text-navy disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-navy px-2 text-slate-500">or continue with</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:border-slate-500">
          Login with Google
        </button>
        <button type="button" className="rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:border-slate-500">
          Login with Apple
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="text-pitch hover:underline">Create one</Link>
      </p>

      <div className="mt-8 rounded-xl border border-slate-800 bg-navy-light p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Demo credentials</p>
        <ul className="mt-3 space-y-2">
          {DEMO_CREDENTIALS.map((d) => (
            <li key={d.email}>
              <button
                type="button"
                onClick={() => fillDemo(d.email, d.password)}
                className="w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-xs hover:border-pitch/50"
              >
                <span className="font-medium capitalize text-pitch">{d.role}</span>
                <span className="block text-slate-400">{d.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
