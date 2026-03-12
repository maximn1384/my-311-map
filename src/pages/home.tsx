import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@fluentui/react-components'
import { CaseMap } from '@/components/map/CaseMap'
import { ServiceFactory } from '@/services/ServiceFactory'
import type { ICase } from '@/types/ICase'

export default function HomePage() {
  const [selectedCase, setSelectedCase] = useState<ICase | null>(null)

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => ServiceFactory.getService().getCases(),
  })

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
        cases={cases}
        selectedCaseId={selectedCase?.incidentid ?? null}
        onSelectCase={setSelectedCase}
      />
    </div>
  )
}