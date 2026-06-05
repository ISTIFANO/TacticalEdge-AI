import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { ArticleImage } from './ArticleImage'

const STORAGE_KEY = 'tacticzone_news_popup_seen'

const FEATURED = {
  id: 'south-korea-tactical-flexibility',
  title: 'South Korea: Tactical Flexibility at the World Cup',
  image_url: '/news/south-korea.jpg',
}

export function NewsWelcomePopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = window.setTimeout(() => setVisible(true), 3000)
    return () => window.clearTimeout(timer)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80">
      <div className="relative overflow-hidden rounded-xl border border-pitch/40 bg-navy-light shadow-xl shadow-black/40">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-slate-300 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <Link to={`/app/news/${FEATURED.id}`} onClick={dismiss} className="block">
          <ArticleImage
            src={FEATURED.image_url}
            alt={FEATURED.title}
            className="h-36 w-full object-cover"
          />
          <div className="p-4">
            <p className="text-sm font-semibold text-white">Improve your coaching</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Latest article — read tactical news in the sidebar under{' '}
              <span className="font-medium text-pitch">Coach News</span>.
            </p>
            <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-200">{FEATURED.title}</p>
            <span className="mt-2 inline-block text-xs font-medium text-pitch hover:underline">
              Read news now →
            </span>
          </div>
        </Link>

        <div className="absolute -left-1 bottom-10 h-3 w-3 rotate-45 border-b border-l border-pitch/40 bg-navy-light" />
      </div>
    </div>
  )
}
