interface PiMoroccoMapProps {
  className?: string
  alt?: string
}

export function PiMoroccoMap({
  className = '',
  alt = 'Carte Pi Maroc — Recherchez des vendeurs ou des Pi',
}: PiMoroccoMapProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[var(--wc-border)] bg-[#1a3a2a] shadow-xl ${className}`}>
      <img
        src="/pi-morocco-map.png"
        alt={alt}
        className="w-full object-cover object-center"
        loading="lazy"
      />
    </div>
  )
}
