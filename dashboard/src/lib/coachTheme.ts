export const coachColors = {
  pitchGreen: '#0A3D1F',
  electricLime: '#AAFF45',
  stadiumNavy: '#0D1B2A',
  coolWhite: '#F0F4F8',
  trophyGold: '#FFD700',
  surfaceCard: '#111827',
  borderPitch: '#1a3a2a',
  textPrimary: '#FFFFFF',
  textMuted: '#94a3b8',
  win: '#22c55e',
  loss: '#ef4444',
  draw: '#64748b',
} as const

export const coachMotion = {
  spring: { type: 'spring' as const, stiffness: 300, damping: 25 },
  stagger: 0.05,
  rowStagger: 0.04,
  countUpDuration: 1200,
} as const

export const coachShadows = {
  cardGlow: '0 0 24px rgba(170, 255, 69, 0.08)',
  cardGlowHover: '0 0 32px rgba(170, 255, 69, 0.2)',
} as const

export const coachSpacing = {
  cardPadding: 16,
  cardRadius: 12,
  sectionGap: 32,
} as const
