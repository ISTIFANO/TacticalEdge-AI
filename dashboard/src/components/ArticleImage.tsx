import { useState, type CSSProperties } from 'react'
import { Newspaper } from 'lucide-react'
import { cn } from '../lib/utils'

interface ArticleImageProps {
  src: string
  alt: string
  className?: string
  style?: CSSProperties
}

export function ArticleImage({ src, alt, className, style }: ArticleImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-800 text-slate-500',
          className,
        )}
      >
        <Newspaper className="h-10 w-10 opacity-40" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
