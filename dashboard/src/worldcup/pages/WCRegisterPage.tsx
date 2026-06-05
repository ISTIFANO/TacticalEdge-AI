import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'
import { useWCAuth, type WCRole } from '../context/WCAuthContext'

export function WCRegisterPage() {
  const { t } = useI18n()
  const { register } = useWCAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', country: 'Morocco', role: 'fan' as WCRole })
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/world-cup/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">{t('nav.register')}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="wc-input w-full" placeholder="Full name" />
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="wc-input w-full" placeholder="Email" />
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="wc-input w-full" placeholder="Password" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as WCRole })} className="wc-input w-full">
          <option value="fan">Fan</option>
          <option value="hotel_manager">Hotel Manager</option>
          <option value="travel_agency">Travel Agency</option>
        </select>
        <button type="submit" className="wc-btn-primary w-full">{t('nav.register')}</button>
      </form>
      <p className="mt-4 text-sm"><Link to="/world-cup/login" className="text-[var(--wc-gold)]">{t('nav.login')}</Link></p>
    </div>
  )
}
