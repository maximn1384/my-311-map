import { Marker } from 'react-map-gl/maplibre'
import { getCaseTypeColor } from '@/constants/caseTypeColors'
import type { ICase } from '@/types/ICase'

interface CasePinProps {
  incident: ICase
  isSelected: boolean
  onSelect: (incident: ICase) => void
}

export function CasePin({ incident, isSelected, onSelect }: CasePinProps) {
  const color = getCaseTypeColor(incident.casetypecode)
  const size = isSelected ? 22 : 16

  return (
    <Marker
      longitude={incident.hippo_longitude!}
      latitude={incident.hippo_latitude!}
      anchor="center"
      onClick={() => onSelect(incident)}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          border: `${isSelected ? 3 : 2}px solid white`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.45)',
          cursor: 'pointer',
        }}
      />
    </Marker>
  )
}
