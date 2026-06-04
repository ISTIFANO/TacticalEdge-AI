import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'
import { lineupRowVariants } from './motion'
import type { Column } from '../DataTable'

interface AnimatedDataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  keyField?: string
  className?: string
}

export function AnimatedDataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField = 'shirt_number',
  className,
}: AnimatedDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [hoverRow, setHoverRow] = useState<number | null>(null)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = Number(a[sortKey]) || 0
      const bv = Number(b[sortKey]) || 0
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [data, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-coach-border', className)}>
      <table className="w-full text-sm">
        <thead className="bg-coach-surface">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'coach-heading px-4 py-3 text-left text-xs font-semibold text-slate-500',
                  col.sortable && 'cursor-pointer select-none hover:text-coach-lime',
                  col.align === 'right' && 'text-right',
                )}
                onClick={() => col.sortable && toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <motion.tr
              key={String(row[keyField] ?? i)}
              custom={i}
              variants={lineupRowVariants}
              initial="hidden"
              animate="visible"
              onMouseEnter={() => setHoverRow(i)}
              onMouseLeave={() => setHoverRow(null)}
              className="relative border-t border-coach-border/60 transition-colors hover:bg-coach-lime/5"
            >
              {hoverRow === i && (
                <td className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-coach-lime" colSpan={0} />
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-slate-300', col.align === 'right' && 'text-right')}
                  style={hoverRow === i ? { boxShadow: 'inset 4px 0 0 #AAFF45' } : undefined}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
