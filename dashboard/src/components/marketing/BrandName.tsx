import { cn } from '../../lib/utils'

interface BrandNameProps {
  className?: string
  accentClassName?: string
}

export function BrandName({ className, accentClassName = 'text-pitch' }: BrandNameProps) {
  return (
    <span className={cn('font-bold text-white', className)}>
      morocco2030<span className={accentClassName}>.PI</span>
    </span>
  )
}
