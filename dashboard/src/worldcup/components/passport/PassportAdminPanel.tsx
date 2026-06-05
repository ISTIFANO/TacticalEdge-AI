import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { QrCode, Settings, Users } from 'lucide-react'
import { usePassport } from '../../context/PassportContext'
import { RARITY_STYLES } from '../../data/passportData'
import type { Rarity } from '../../types/passport'

const RARITY_COLORS: Record<Rarity, string> = {
  common: '#64748b',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export function PassportAdminPanel() {
  const { getAllPassportsStats, rarityConfig, setRarityConfig, validateTicketQRGlobal } = usePassport()
  const stats = getAllPassportsStats()
  const [qrInput, setQrInput] = useState('')
  const [qrResult, setQrResult] = useState<{ valid: boolean; message: string; collectible?: { serialNumber: string; title: string } } | null>(null)

  const chartData = (Object.entries(stats.byRarity) as [Rarity, number][]).map(([rarity, count]) => ({
    name: RARITY_STYLES[rarity].label,
    count,
    rarity,
  }))

  const handleValidate = () => {
    const result = validateTicketQRGlobal(qrInput.trim())
    setQrResult(result)
  }

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-bold">Fan Passport Admin</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="wc-card p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-[var(--wc-gold)]" />
          <p className="mt-2 text-3xl font-black">{stats.totalFans}</p>
          <p className="text-sm text-[var(--wc-muted)]">Registered Passports</p>
        </div>
        <div className="wc-card p-6 text-center">
          <p className="text-3xl font-black text-[var(--wc-gold)]">{stats.totalCollectibles}</p>
          <p className="text-sm text-[var(--wc-muted)]">Collectibles Minted</p>
        </div>
        <div className="wc-card p-6 text-center">
          <p className="text-3xl font-black text-purple-400">{stats.byRarity.legendary ?? 0}</p>
          <p className="text-sm text-[var(--wc-muted)]">Legendary Items</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="wc-card p-6">
          <h3 className="flex items-center gap-2 font-bold">
            <BarChart className="h-5 w-5 text-[var(--wc-gold)]" /> Engagement Analytics
          </h3>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.rarity} fill={RARITY_COLORS[entry.rarity]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="wc-card p-6">
          <h3 className="flex items-center gap-2 font-bold">
            <QrCode className="h-5 w-5 text-[var(--wc-gold)]" /> QR Ticket Validation
          </h3>
          <p className="mt-1 text-sm text-[var(--wc-muted)]">Scan or paste QR payload to validate stadium entry</p>
          <textarea
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder='{"v":1,"serial":"WC2030-..."}'
            className="wc-input mt-4 h-24 w-full font-mono text-xs"
          />
          <button type="button" onClick={handleValidate} className="wc-btn-primary mt-3 w-full">
            Validate Ticket
          </button>
          {qrResult && (
            <div className={`mt-4 rounded-xl p-4 text-sm ${qrResult.valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {qrResult.message}
              {qrResult.collectible && (
                <p className="mt-2 font-mono text-xs opacity-70">{qrResult.collectible.serialNumber} — {qrResult.collectible.title}</p>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="wc-card p-6">
        <h3 className="flex items-center gap-2 font-bold">
          <Settings className="h-5 w-5 text-[var(--wc-gold)]" /> Rarity Configuration
        </h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(rarityConfig.pointsByRarity) as [Rarity, number][]).map(([rarity, points]) => (
            <div key={rarity} className="rounded-xl border border-[var(--wc-border)] p-4">
              <p className="text-xs font-bold uppercase text-[var(--wc-gold)]">{RARITY_STYLES[rarity].label}</p>
              <label className="mt-2 block text-xs text-[var(--wc-muted)]">Loyalty points</label>
              <input
                type="number"
                value={points}
                onChange={(e) =>
                  setRarityConfig({
                    ...rarityConfig,
                    pointsByRarity: { ...rarityConfig.pointsByRarity, [rarity]: Number(e.target.value) },
                  })
                }
                className="wc-input mt-1 w-full"
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-xs text-[var(--wc-muted)]">Hotel rare min stars</label>
          <input
            type="number"
            min={3}
            max={5}
            value={rarityConfig.hotelRareMinStars}
            onChange={(e) => setRarityConfig({ ...rarityConfig, hotelRareMinStars: Number(e.target.value) })}
            className="wc-input mt-1 w-32"
          />
        </div>
      </section>
    </div>
  )
}
