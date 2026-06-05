import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-400">We will send a reset link to your email</p>

      {sent ? (
        <div className="mt-8 rounded-lg border border-pitch/30 bg-pitch/10 p-4 text-sm text-slate-300">
          If an account exists for <strong className="text-white">{email}</strong>, a reset link has been sent.
          For demo purposes, continue to{' '}
          <Link to="/reset-password" className="text-pitch hover:underline">reset password</Link>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
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
            />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-pitch py-2.5 font-semibold text-navy disabled:opacity-60">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="text-pitch hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}
