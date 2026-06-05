import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const COACHING_LEVELS = ['Grassroots', 'Academy', 'Semi-Pro', 'Pro', 'International']
const COUNTRIES = ['Morocco', 'France', 'Spain', 'UK', 'USA', 'Brazil', 'Other']

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    club: '',
    email: '',
    password: '',
    confirm: '',
    country: 'Morocco',
    coachingLevel: 'Semi-Pro',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await register({
        name: form.name,
        club: form.club,
        email: form.email,
        password: form.password,
        country: form.country,
        coachingLevel: form.coachingLevel,
      })
      navigate('/coach', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Create your account</h1>
      <p className="mt-1 text-sm text-slate-400">Start analyzing matches and earning coach XP today</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
        )}
        <div>
          <label className="text-sm text-slate-400">Full Name</label>
          <input required {...field('name')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch" />
        </div>
        <div>
          <label className="text-sm text-slate-400">Club / Team Name</label>
          <input required {...field('club')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch" />
        </div>
        <div>
          <label className="text-sm text-slate-400">Email</label>
          <input type="email" required {...field('email')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input type="password" required {...field('password')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch" />
          </div>
          <div>
            <label className="text-sm text-slate-400">Confirm Password</label>
            <input type="password" required {...field('confirm')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-400">Country</label>
            <select {...field('country')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch">
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">Coaching Level</label>
            <select {...field('coachingLevel')} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy-light px-3 py-2.5 text-white outline-none focus:border-pitch">
              {COACHING_LEVELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-pitch py-2.5 font-semibold text-navy disabled:opacity-60">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className="text-pitch hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
