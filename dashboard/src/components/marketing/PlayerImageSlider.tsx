import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { MOROCCO2030_SLIDES, type SliderSlide } from '../../data/morocco2030Slider'

const AUTO_MS = 4500

export function PlayerImageSlider() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const slides = MOROCCO2030_SLIDES
  const current = slides[index]

  const go = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1)
      setIndex((next + slides.length) % slides.length)
    },
    [index, slides.length],
  )

  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    if (reduced) return
    const t = setInterval(next, AUTO_MS)
    return () => clearInterval(t)
  }, [next, reduced])

  return (
    <div className="relative">
      {/* Main animated slider */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-black shadow-2xl shadow-red-900/20">
        <div className="relative aspect-[16/10] sm:aspect-[16/9]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -80 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute inset-0"
            >
              <img
                src={current.image}
                alt={current.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-0.5 text-xs font-bold text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Atlas Lions · WC 2030
                </span>
                <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">{current.name}</h3>
                <p className="text-sm font-medium text-red-200">{current.position}</p>
                <p className="text-xs text-slate-400">{current.club}</p>
                <p className="mt-2 max-w-lg text-sm text-slate-300">{current.caption}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-red-600/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-red-600/80"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to ${s.name}`}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-red-500' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Infinite marquee strip */}
      {!reduced && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-navy-light/50 py-3">
          <MarqueeTrack slides={slides} />
        </div>
      )}

      {/* Thumbnail row */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition ${
              i === index ? 'border-red-500 ring-2 ring-red-500/30' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={s.image} alt="" className="h-16 w-24 object-cover sm:h-20 sm:w-32" />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] text-white truncate">
              {s.name.split(' ').pop()}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MarqueeTrack({ slides }: { slides: SliderSlide[] }) {
  const doubled = [...slides, ...slides]
  return (
    <div className="flex w-max animate-marquee gap-4 px-4">
      {doubled.map((s, i) => (
        <div key={`${s.id}-${i}`} className="flex shrink-0 items-center gap-3 rounded-lg bg-black/30 px-3 py-2">
          <img src={s.image} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-red-500/40" />
          <div>
            <p className="text-xs font-semibold text-white">{s.name}</p>
            <p className="text-[10px] text-slate-500">{s.position}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
