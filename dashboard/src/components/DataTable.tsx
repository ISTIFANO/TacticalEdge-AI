import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  keyField?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField = 'shirt_number',
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

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

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-slate-500">No data available</p>
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-700/80', className)}>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-navy-light/80 text-left text-xs uppercase tracking-wider text-slate-400">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-medium',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.sortable && 'cursor-pointer select-none hover:text-slate-200',
                )}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={String(row[keyField] ?? i)} className="border-b border-slate-800/80 hover:bg-navy-light/40">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-slate-300',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
