import { polylineDistanceKm, estimateDurationHours, formatDuration } from '../utils/geo'
import { exportAllData, importJsonFile } from '../utils/storage'

export default function Sidebar({
  draftRoute,
  routes,
  annotations,
  activities,
  onSaveDraftRoute,
  onClearDraftRoute,
  onDeleteRoute,
  onDeleteAnnotation,
  onDeleteActivity,
  allData,
  onImportData
}) {
  const draftDistance = polylineDistanceKm(draftRoute)
  const draftDuration = estimateDurationHours(draftDistance, 5)

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importJsonFile(file)
      onImportData(data)
      alert('Import successful.')
    } catch {
      alert('Import failed. Invalid JSON.')
    }
  }

  return (
    <aside className="sidebar">
      <div className="panel">
        <h2>WaterSport Demo</h2>
        <p className="muted">
          Paddle planning, route saving, water notes, and ride tracking for Hungary and nearby waters.
        </p>
      </div>

      <div className="panel">
        <h3>Draft Route</h3>
        <div>Points: {draftRoute.length}</div>
        <div>Distance: {draftDistance.toFixed(2)} km</div>
        <div>ETA @ 5 km/h: {formatDuration(draftDuration)}</div>

        <div className="stack">
          <button onClick={onSaveDraftRoute} disabled={draftRoute.length < 2}>
            Save Route
          </button>
          <button onClick={onClearDraftRoute} disabled={draftRoute.length === 0}>
            Clear Draft
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Routes</h3>
        <div className="list">
          {routes.map((route) => {
            const dist = polylineDistanceKm(route.points)
            const eta = estimateDurationHours(dist, route.estimatedSpeedKmh || 5)
            return (
              <div key={route.id} className="list-item">
                <strong>{route.name}</strong>
                <div>{dist.toFixed(2)} km · {formatDuration(eta)}</div>
                <button className="small danger" onClick={() => onDeleteRoute(route.id)}>
                  Delete
                </button>
              </div>
            )
          })}
          {routes.length === 0 && <div className="muted">No saved routes yet.</div>}
        </div>
      </div>

      <div className="panel">
        <h3>Annotations</h3>
        <div className="list">
          {annotations.map((ann) => (
            <div key={ann.id} className="list-item">
              <strong>{ann.title}</strong>
              <div>{ann.type}</div>
              <button className="small danger" onClick={() => onDeleteAnnotation(ann.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Activities</h3>
        <div className="list">
          {activities.map((act) => (
            <div key={act.id} className="list-item">
              <strong>{act.name}</strong>
              <div>{act.distanceKm.toFixed(2)} km</div>
              <button className="small danger" onClick={() => onDeleteActivity(act.id)}>
                Delete
              </button>
            </div>
          ))}
          {activities.length === 0 && <div className="muted">No saved activities yet.</div>}
        </div>
      </div>

      <div className="panel">
        <h3>Import / Export</h3>
        <div className="stack">
          <button onClick={() => exportAllData(allData)}>Export JSON</button>
          <label className="file-label">
            Import JSON
            <input type="file" accept="application/json" onChange={handleImport} />
          </label>
        </div>
      </div>
    </aside>
  )
}
