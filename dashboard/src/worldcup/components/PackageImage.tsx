import { useState } from 'react'

const FALLBACK = '/wc-packages/tri-nation-ultimate.png'

interface PackageImageProps {
  src: string
  alt: string
  className?: string
}

export function PackageImage({ src, alt, className }: PackageImageProps) {
  const [current, setCurrent] = useState(src)

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK)
      }}
    />
  )
}
