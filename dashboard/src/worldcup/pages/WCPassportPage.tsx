import { Navigate } from 'react-router-dom'
import { Award, Gift, Sparkles } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { usePassport } from '../context/PassportContext'
import { useWCAuth } from '../context/WCAuthContext'
import { FanProfilePanel } from '../components/passport/FanProfilePanel'
import { PassportWallet } from '../components/passport/PassportWallet'
import { BadgeShowcase } from '../components/passport/BadgeShowcase'
import { FanPassportMap } from '../components/passport/FanPassportMap'
import { LeaderboardPanel } from '../components/passport/LeaderboardPanel'

export function WCPassportPage() {
  const { user } = useWCAuth()
  const { passport } = usePassport()
  const { t } = useI18n()

  if (!user) return <Navigate to="/world-cup/login" replace />
  if (user.role !== 'fan') return <Navigate to="/world-cup/dashboard" replace />

  const multiMatchReward = passport && passport.matchCount >= 3

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="passport-hero mb-10 overflow-hidden rounded-3xl border border-[var(--wc-gold)]/30 bg-gradient-to-br from-[#0a1628] via-[#1a1a2e] to-[#0a1628] p-8">
        <div className="passport-shimmer pointer-events-none absolute inset-0 opacity-10" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-[var(--wc-gold)]">
              <Sparkles className="h-4 w-4" /> {t('passport.title')}
            </p>
            <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">{t('passport.subtitle')}</h1>
            <p className="mt-3 max-w-xl text-slate-400">{t('passport.desc')}</p>
          </div>
          {passport && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
                <p className="text-3xl font-black text-[var(--wc-gold)]">{passport.collectibles.length}</p>
                <p className="text-[10px] uppercase text-slate-400">{t('passport.collectibles')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
                <p className="text-3xl font-black text-purple-400">{passport.badges.length}</p>
                <p className="text-[10px] uppercase text-slate-400">{t('passport.badges')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur">
                <p className="text-3xl font-black text-emerald-400">{passport.loyaltyPoints}</p>
                <p className="text-[10px] uppercase text-slate-400">{t('passport.points')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {multiMatchReward && (
        <div className="passport-reward-banner mb-8 flex items-center gap-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5">
          <Gift className="h-10 w-10 text-amber-400" />
          <div>
            <p className="font-bold text-amber-200">{t('passport.multi_reward')}</p>
            <p className="text-sm text-amber-200/70">{t('passport.multi_reward_desc')}</p>
          </div>
          <Award className="ms-auto h-8 w-8 text-amber-400/50" />
        </div>
      )}

      <div className="space-y-12">
        <FanProfilePanel />
        <PassportWallet />
        <div className="grid gap-8 lg:grid-cols-2">
          <FanPassportMap />
          <LeaderboardPanel />
        </div>
        <BadgeShowcase />
      </div>
    </div>
  )
}
