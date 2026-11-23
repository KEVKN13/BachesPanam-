import { useEffect, useRef } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { gravedadLabel } from '../utils/format'
import { pickedIcon, severityIcon, userLocationIcon } from '../utils/leafletIcons'

function MapController({ focus, homeCenter }) {
  const map = useMap()
  const focusLat = focus?.[0]
  const focusLng = focus?.[1]
  const homeLat = homeCenter?.[0]
  const homeLng = homeCenter?.[1]

  useEffect(() => {
    const target =
      focusLat != null && focusLng != null ? [focusLat, focusLng] : null
    const fallback =
      homeLat != null && homeLng != null ? [homeLat, homeLng] : null

    if (!target && !fallback) return

    map.flyTo(target || fallback, target ? 17 : 12, { duration: 0.8 })
  }, [focusLat, focusLng, homeLat, homeLng, map])

  return null
}

function ClickHandler({ enabled, onPick }) {
  const onPickRef = useRef(onPick)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useMapEvents({
    click(event) {
      if (!enabled) return
      onPickRef.current({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      })
    },
  })

  return null
}

export default function MapView({
  reports,
  homeCenter,
  focus,
  selectedId,
  onSelect,
  pickMode,
  picked,
  onPick,
  userLocation,
}) {
  return (
    <MapContainer
      center={homeCenter}
      zoom={12}
      className="map-canvas"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController focus={focus} homeCenter={homeCenter} />
      <ClickHandler enabled={pickMode} onPick={onPick} />

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={severityIcon(report.gravedad, report.id === selectedId)}
          eventHandlers={{ click: () => onSelect(report.id) }}
        >
          <Popup>
            <strong>{report.titulo}</strong>
            <br />
            Gravedad: {gravedadLabel(report.gravedad)} · {report.votosCount} votos
            <br />
            {report.estado}
          </Popup>
        </Marker>
      ))}

      {pickMode && picked?.lat !== '' && picked?.lng !== '' && picked?.lat != null && picked?.lng != null && (
        <Marker
          position={[Number(picked.lat), Number(picked.lng)]}
          icon={pickedIcon}
        >
          <Popup>Ubicación del bache</Popup>
        </Marker>
      )}

      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={Math.min(userLocation.accuracy || 30, 150)}
            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.12, weight: 1 }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              Tu ubicación exacta
              <br />
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  )
}
