import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '@/hooks/useGeolocation'
import { CasePin } from './CasePin'
import type { ICase } from '@/types/ICase'

// Default center: Seattle, WA — used until geolocation resolves
const DEFAULT_CENTER: [number, number] = [47.6062, -122.3321]
const DEFAULT_ZOOM = 13

interface RecenterMapProps {
  latitude: number
  longitude: number
}

// Must live inside MapContainer to access the Leaflet map instance
function RecenterMap({ latitude, longitude }: RecenterMapProps) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([latitude, longitude], DEFAULT_ZOOM)
  }, [latitude, longitude, map])
  return null
}

interface CaseMapProps {
  cases: ICase[]
  selectedCaseId: string | null
  onSelectCase: (incident: ICase) => void
}

export function CaseMap({ cases, selectedCaseId, onSelectCase }: CaseMapProps) {
  const { coords } = useGeolocation()

  const plottableCases = useMemo(
    () => cases.filter(c => c.hippo_latitude !== null && c.hippo_longitude !== null),
    [cases],
  )

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {coords && (
        <RecenterMap latitude={coords.latitude} longitude={coords.longitude} />
      )}

      {plottableCases.map(c => (
        <CasePin
          key={c.incidentid}
          incident={c}
          isSelected={c.incidentid === selectedCaseId}
          onSelect={onSelectCase}
        />
      ))}
    </MapContainer>
  )
}
