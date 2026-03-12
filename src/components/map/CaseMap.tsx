import { useState, useMemo, useEffect } from 'react'
import Map, { NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { StyleSpecification } from 'maplibre-gl'
import { useGeolocation } from '@/hooks/useGeolocation'
import { CasePin } from './CasePin'
import type { ICase } from '@/types/ICase'

const DEFAULT_CENTER = { longitude: -122.3321, latitude: 47.6062 }
const DEFAULT_ZOOM = 13

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }],
}

interface CaseMapProps {
  cases: ICase[]
  selectedCaseId: string | null
  onSelectCase: (incident: ICase) => void
}

export function CaseMap({ cases, selectedCaseId, onSelectCase }: CaseMapProps) {
  const { coords } = useGeolocation()

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER.longitude,
    latitude: DEFAULT_CENTER.latitude,
    zoom: DEFAULT_ZOOM,
  })

  useEffect(() => {
    if (coords) {
      setViewState(vs => ({ ...vs, latitude: coords.latitude, longitude: coords.longitude }))
    }
  }, [coords])

  const plottableCases = useMemo(
    () => cases.filter(c => c.hippo_latitude !== null && c.hippo_longitude !== null),
    [cases],
  )

  return (
    <Map
      {...viewState}
      onMove={e => setViewState(e.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
    >
      <NavigationControl position="top-left" />

      {plottableCases.map(c => (
        <CasePin
          key={c.incidentid}
          incident={c}
          isSelected={c.incidentid === selectedCaseId}
          onSelect={onSelectCase}
        />
      ))}
    </Map>
  )
}
