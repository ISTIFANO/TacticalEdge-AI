import { useI18n } from '../context/I18nContext'

export function WCContactPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold">{t('contact.title')}</h1>
      <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input className="wc-input w-full" placeholder="Name" />
        <input type="email" className="wc-input w-full" placeholder="Email" />
        <textarea rows={5} className="wc-input w-full" placeholder="Message" />
        <button type="submit" className="wc-btn-primary w-full">Send</button>
      </form>
      <p className="mt-8 text-sm text-[var(--wc-muted)]">support@wc2030.com · Casablanca · Madrid · Lisbon</p>
    </div>
  )
}
