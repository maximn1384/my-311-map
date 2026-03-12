import { useState, useEffect } from 'react'

interface GeolocationCoords {
  latitude: number
  longitude: number
}

interface GeolocationState {
  coords: GeolocationCoords | null
  error: string | null
  loading: boolean
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: 'Geolocation is not supported by this browser', loading: false })
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      err => {
        setState({ coords: null, error: err.message, loading: false })
      },
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }, [])

  return state
}
