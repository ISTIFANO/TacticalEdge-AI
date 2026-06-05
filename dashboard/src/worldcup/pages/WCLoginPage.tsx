import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { WC_DEMO, useWCAuth } from '../context/WCAuthContext'

export function WCLoginPage() {
  const { t } = useI18n()
  const { login } = useWCAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/world-cup/dashboard')
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">{t('nav.login')}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="wc-input w-full" placeholder="Email" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="wc-input w-full" placeholder="Password" />
        <button type="submit" className="wc-btn-primary w-full">{t('nav.login')}</button>
      </form>
      <p className="mt-4 text-sm text-[var(--wc-muted)]">
        <Link to="/world-cup/register" className="text-[var(--wc-gold)]">{t('nav.register')}</Link>
      </p>
      <div className="mt-8 wc-card p-4">
        <p className="text-xs font-semibold uppercase text-[var(--wc-muted)]">Demo accounts</p>
        <ul className="mt-2 space-y-1">
          {WC_DEMO.map((d) => (
            <li key={d.email}>
              <button type="button" onClick={() => { setEmail(d.email); setPassword(d.password) }} className="w-full text-left text-xs hover:text-[var(--wc-gold)]">
                <span className="capitalize">{d.role.replace('_', ' ')}</span> — {d.email}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
