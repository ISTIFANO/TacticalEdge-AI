import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface PlayerCardProps {
  shirtNumber: number | string
  name?: string
  position?: string
  stats?: string
  imageUrl?: string
  active?: boolean
  onClick?: () => void
  index?: number
}

export function PlayerCard({
  shirtNumber,
  name,
  position,
  stats,
  imageUrl,
  active,
  onClick,
  index = 0,
}: PlayerCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -4, boxShadow: '0 0 32px rgba(170, 255, 69, 0.2)' }}
      className={cn(
        'coach-card w-full text-left transition-colors',
        active ? 'border-coach-lime bg-coach-lime/10' : 'hover:border-coach-lime/40',
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="mb-3 h-24 w-full rounded-lg object-cover object-top" />
      ) : (
        <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-coach-pitch/30">
          <span className="coach-stat text-4xl font-bold text-coach-lime">#{shirtNumber}</span>
        </div>
      )}
      {name && <p className="truncate font-semibold text-white">{name}</p>}
      {position && <p className="text-xs text-coach-lime">{position}</p>}
      {stats && <p className="mt-1 text-xs text-slate-500">{stats}</p>}
      {!name && !imageUrl && stats && (
        <p className="coach-stat text-3xl font-bold text-white">#{shirtNumber}</p>
      )}
    </motion.button>
  )
}
