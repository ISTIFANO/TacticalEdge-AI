import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ResetPasswordPage() {
  const { updatePassword, user } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await updatePassword(password)
      navigate('/coach', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Set new password</h1>
      <p className="mt-1 text-sm text-slate-400">
        {user ? `Signed in as ${user.email}` : 'Enter your new password below'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
        )}
        <div>
          <label className="text-sm text-slate-400">New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Confirm Password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-pitch py-2.5 font-semibold text-navy disabled:opacity-60">
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      {!user && (
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="text-pitch hover:underline">Sign in first</Link>
        </p>
      )}
    </div>
  )
}
