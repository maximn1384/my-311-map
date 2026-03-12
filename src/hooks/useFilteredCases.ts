import { useMemo } from 'react'
import type { ICase } from '@/types/ICase'

export function useFilteredCases(cases: ICase[], searchTerm: string): ICase[] {
  return useMemo(() => {
    if (!searchTerm.trim()) return cases
    const lower = searchTerm.toLowerCase()
    return cases.filter(
      c =>
        c.title.toLowerCase().includes(lower) ||
        c.ticketnumber.toLowerCase().includes(lower),
    )
  }, [cases, searchTerm])
}
