import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMapEvents
} from 'react-leaflet'
import L from 'leaflet'
import { polylineDistanceKm, estimateDurationHours, formatDuration } from '../utils/geo'

const defaultIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div class="marker-dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

const poiColors = {
  buffet: '#f59e0b',
  restaurant: '#ef4444',
  water_source: '#38bdf8',
  camping: '#22c55e',
  parking: '#6b7280',
  rental: '#8b5cf6',
  launch: '#06b6d4'
}

const annColors = {
  obstacle: '#dc2626',
  crossing: '#2563eb',
  hazard: '#ea580c',
  portage: '#16a34a',
  lock_weir: '#7c3aed',
  current_note: '#0891b2',
  flow_note: '#0f766e'
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng])
    }
  })
  return null
}

export default function MapView({
  draftRoute,
  setDraftRoute,
  drawMode,
  annotationMode,
  selectedAnnotationType,
  onAddAnnotation,
  pois,
  waters,
  annotations,
  routes,
  trackingPath,
  livePosition
}) {
  function handleMapClick(point) {
    if (drawMode) {
      setDraftRoute((prev) => [...prev, point])
      return
    }

    if (annotationMode) {
      const title = window.prompt(`Enter title for ${selectedAnnotationType}:`)
      if (!title) return
      const note = window.prompt('Optional note:') || ''
      onAddAnnotation({
        id: `ann-${Date.now()}`,
        type: selectedAnnotationType,
        title,
        note,
        position: point
      })
    }
  }

  return (
    <div className="map-wrap">
      <MapContainer
        center={[47.35, 19.2]}
        zoom={7}
        className="map"
      >
        <ClickHandler onMapClick={handleMapClick} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {waters.map((water) => (
          <Polyline
            key={water.id}
            positions={water.centerline}
            pathOptions={{ color: '#38bdf8', weight: 6, opacity: 0.65 }}
          >
            <Popup>
              <strong>{water.name}</strong>
              <div>Type: {water.type}</div>
              <div>Flow: {water.properties.flow}</div>
              <div>Current: {water.properties.current}</div>
              <div>{water.properties.notes}</div>
            </Popup>
          </Polyline>
        ))}

        {pois.map((poi) => (
          <CircleMarker
            key={poi.id}
            center={poi.position}
            radius={8}
            pathOptions={{
              color: poiColors[poi.category] || '#0ea5e9',
              fillColor: poiColors[poi.category] || '#0ea5e9',
              fillOpacity: 0.9
            }}
          >
            <Popup>
              <strong>{poi.name}</strong>
              <div>{poi.category}</div>
              <div>{poi.description}</div>
            </Popup>
          </CircleMarker>
        ))}

        {annotations.map((ann) => (
          <CircleMarker
            key={ann.id}
            center={ann.position}
            radius={7}
            pathOptions={{
              color: annColors[ann.type] || '#334155',
              fillColor: annColors[ann.type] || '#334155',
              fillOpacity: 0.9
            }}
          >
            <Popup>
              <strong>{ann.title}</strong>
              <div>{ann.type}</div>
              <div>{ann.note}</div>
            </Popup>
          </CircleMarker>
        ))}

        {routes.map((route) => {
          const dist = polylineDistanceKm(route.points)
          const eta = estimateDurationHours(dist, route.estimatedSpeedKmh || 5)
          return (
            <Polyline
              key={route.id}
              positions={route.points}
              pathOptions={{ color: '#0f172a', weight: 4 }}
            >
              <Popup>
                <strong>{route.name}</strong>
                <div>{dist.toFixed(2)} km</div>
                <div>{formatDuration(eta)}</div>
              </Popup>
            </Polyline>
          )
        })}

        {draftRoute.length > 0 && (
          <Polyline
            positions={draftRoute}
            pathOptions={{ color: '#06b6d4', weight: 4, dashArray: '8 6' }}
          />
        )}

        {trackingPath.length > 0 && (
          <Polyline
            positions={trackingPath}
            pathOptions={{ color: '#f97316', weight: 5 }}
          />
        )}

        {livePosition && (
          <Marker position={livePosition} icon={defaultIcon}>
            <Popup>Current tracked position</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
