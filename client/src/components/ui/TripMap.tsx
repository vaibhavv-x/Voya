import { useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'

const VOYA_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#FAF9F6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6F6F6F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FAF9F6' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#ADADAD' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F4F2EE' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E8E4DC' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#6F6F6F' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F0E4D3' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DDE7E8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ADADAD' }] },
]

const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

interface TripMapProps {
  lat: number
  lng: number
  label: string
}

function StaticPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-72 rounded-2xl bg-surface border border-black/6 flex flex-col items-center justify-center text-center px-6">
      <MapPin size={22} className="text-amber mb-2" />
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-mist mt-1">Map preview unavailable — add a Google Maps API key to enable it.</p>
    </div>
  )
}

export default function TripMap({ lat, lng, label }: TripMapProps) {
  if (!MAP_KEY) return <StaticPlaceholder label={label} />
  return <LoadedMap lat={lat} lng={lng} label={label} />
}

function LoadedMap({ lat, lng, label }: TripMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'voya-google-maps',
    googleMapsApiKey: MAP_KEY!,
  })

  const center = useMemo(() => ({ lat, lng }), [lat, lng])

  if (loadError) return <StaticPlaceholder label={label} />
  if (!isLoaded) return <div className="w-full h-72 rounded-2xl skeleton" />

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-black/6">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={9}
        options={{
          styles: VOYA_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
        }}
      >
        <Marker
          position={center}
          title={label}
          icon={{
            path: 'M12 2C7.58 2 4 5.58 4 10c0 6 8 12 8 12s8-6 8-12c0-4.42-3.58-8-8-8z',
            fillColor: '#C8853A',
            fillOpacity: 1,
            strokeColor: '#FAF9F6',
            strokeWeight: 1.5,
            scale: 1.6,
          }}
        />
      </GoogleMap>
    </div>
  )
}
