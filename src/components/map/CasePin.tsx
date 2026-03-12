import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getCaseTypeColor } from '@/constants/caseTypeColors'
import type { ICase } from '@/types/ICase'

interface CasePinProps {
  incident: ICase
  isSelected: boolean
  onSelect: (incident: ICase) => void
}

function createPinIcon(color: string, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 22 : 16
  const anchor = size / 2
  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      border: ${isSelected ? '3px' : '2px'} solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.45);
      cursor: pointer;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  })
}

export function CasePin({ incident, isSelected, onSelect }: CasePinProps) {
  const color = getCaseTypeColor(incident.casetypecode)
  const icon = createPinIcon(color, isSelected)

  return (
    <Marker
      position={[incident.hippo_latitude!, incident.hippo_longitude!]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(incident) }}
    />
  )
}
