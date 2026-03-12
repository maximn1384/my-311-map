import { useState } from 'react'
import { Spinner, makeStyles, tokens } from '@fluentui/react-components'
import { CaseMap } from '@/components/map/CaseMap'
import { SearchBar } from '@/components/SearchBar'
import { CaseCallout } from '@/components/CaseCallout'
import { CreateCaseButton } from '@/components/CreateCaseButton'
import { useCases } from '@/hooks/useCases'
import { useFilteredCases } from '@/hooks/useFilteredCases'
import type { ICase } from '@/types/ICase'

const useStyles = makeStyles({
  toolbar: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
})

export default function MapPage() {
  const styles = useStyles()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState<ICase | null>(null)

  const { data: cases = [], isLoading } = useCases()
  const filteredCases = useFilteredCases(cases, searchTerm)

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner label="Loading cases…" />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <CaseMap
        cases={filteredCases}
        selectedCaseId={selectedCase?.incidentid ?? null}
        onSelectCase={setSelectedCase}
      />
      <div className={styles.toolbar}>
        <SearchBar value={searchTerm} onSearch={setSearchTerm} />
        <CreateCaseButton onClick={() => console.log('TODO Phase 5: Create new case')} />
      </div>
      <CaseCallout
        incident={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  )
}
