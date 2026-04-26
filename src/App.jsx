import { useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import { seededPois } from './data/pois'
import { seededWaters, seededAnnotations } from './data/waters'
import { seededRoutes } from './data/routes'
import { loadStored, saveStored } from './utils/storage'
import { polylineDistanceKm, routeWaterWarning } from './utils/geo'
import { createSimulatedTrack } from './utils/simulation'

export default function App() {
  const [pois] = useState(seededPois)
  const [waters] = useState(seededWaters)
  const [routes, setRoutes] = useState(() => {
    const stored = loadStored('routes', [])
    return [...seededRoutes, ...stored]
  })
  const [annotations, setAnnotations] = useState(() => {
    const stored = loadStored('annotations', [])
    return [...seededAnnotations, ...stored]
  })
  const [activities, setActivities] = useState(() => loadStored('activities', []))

  const [draftRoute, setDraftRoute] = useState([])
  const [drawMode, setDrawMode] = useState(false)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [selectedAnnotationType, setSelectedAnnotationType] = useState('obstacle')

  const [trackingPath, setTrackingPath] = useState([])
  const [livePosition, setLivePosition] = useState(null)
  const [tracking, setTracking] = useState({
    gpsActive: false,
    simActive: false
  })

  const gpsWatchRef = useRef(null)
  const stopSimulationRef = useRef(null)

  useEffect(() => {
    const customRoutes = routes.filter((r) => !seededRoutes.some((sr) => sr.id === r.id))
    saveStored('routes', customRoutes)
  }, [routes])

  useEffect(() => {
    const customAnnotations = annotations.filter(
      (a) => !seededAnnotations.some((sa) => sa.id === a.id)
    )
    saveStored('annotations', customAnnotations)
  }, [annotations])

  useEffect(() => {
    saveStored('activities', activities)
  }, [activities])

  function saveDraftRoute() {
    if (draftRoute.length < 2) return

    const warning = routeWaterWarning(draftRoute, waters)
    if (warning && !window.confirm(`${warning}\n\nSave anyway?`)) {
      return
    }

    const name = window.prompt('Route name:', `Custom Route ${routes.length + 1}`)
    if (!name) return

    const speed = Number(window.prompt('Estimated paddling speed (km/h):', '5')) || 5

    setRoutes((prev) => [
      ...prev,
      {
        id: `route-${Date.now()}`,
        name,
        points: draftRoute,
        estimatedSpeedKmh: speed
      }
    ])
    setDraftRoute([])
    setDrawMode(false)
  }

  function clearDraftRoute() {
    setDraftRoute([])
  }

  function addAnnotation(annotation) {
    setAnnotations((prev) => [...prev, annotation])
    setAnnotationMode(false)
  }

  function deleteRoute(id) {
    setRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  function deleteAnnotation(id) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  function deleteActivity(id) {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  function stopGpsTracking(save = true) {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current)
      gpsWatchRef.current = null
    }

    if (save && trackingPath.length > 1) {
      const distanceKm = polylineDistanceKm(trackingPath)
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          name: `GPS Activity ${new Date().toLocaleString()}`,
          points: trackingPath,
          distanceKm
        },
        ...prev
      ])
    }

    setTracking((prev) => ({ ...prev, gpsActive: false }))
    setTrackingPath([])
    setLivePosition(null)
  }

  function startGpsTracking() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.')
      return
    }

    setTrackingPath([])
    setTracking((prev) => ({ ...prev, gpsActive: true }))

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point = [pos.coords.latitude, pos.coords.longitude]
        setLivePosition(point)
        setTrackingPath((prev) => [...prev, point])
      },
      () => {
        alert('Unable to read GPS position.')
        stopGpsTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      }
    )
  }

  function stopSimulation(save = true) {
    if (stopSimulationRef.current) {
      stopSimulationRef.current()
      stopSimulationRef.current = null
    }

    if (save && trackingPath.length > 1) {
      const distanceKm = polylineDistanceKm(trackingPath)
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          name: `Simulated Activity ${new Date().toLocaleString()}`,
          points: trackingPath,
          distanceKm
        },
        ...prev
      ])
    }

    setTracking((prev) => ({ ...prev, simActive: false }))
    setTrackingPath([])
    setLivePosition(null)
  }

  function startSimulation() {
    const sourceRoute = routes[0]
    if (!sourceRoute || sourceRoute.points.length < 2) {
      alert('No route available for simulation.')
      return
    }

    setTrackingPath([])
    setTracking((prev) => ({ ...prev, simActive: true }))

    stopSimulationRef.current = createSimulatedTrack(
      sourceRoute.points,
      (point) => {
        setLivePosition(point)
        setTrackingPath((prev) => [...prev, point])
      },
      () => {
        stopSimulation(true)
      },
      1000
    )
  }

  function importData(data) {
    if (data.routes) setRoutes([...seededRoutes, ...data.routes])
    if (data.annotations) setAnnotations([...seededAnnotations, ...data.annotations])
    if (data.activities) setActivities(data.activities)
  }

  const allData = useMemo(
    () => ({
      routes,
      annotations,
      activities
    }),
    [routes, annotations, activities]
  )

  return (
    <div className="app-shell">
      <Sidebar
        draftRoute={draftRoute}
        routes={routes}
        annotations={annotations}
        activities={activities}
        onSaveDraftRoute={saveDraftRoute}
        onClearDraftRoute={clearDraftRoute}
        onDeleteRoute={deleteRoute}
        onDeleteAnnotation={deleteAnnotation}
        onDeleteActivity={deleteActivity}
        allData={allData}
        onImportData={importData}
      />

      <main className="main-content">
        <Toolbar
          drawMode={drawMode}
          setDrawMode={setDrawMode}
          annotationMode={annotationMode}
          setAnnotationMode={setAnnotationMode}
          selectedAnnotationType={selectedAnnotationType}
          setSelectedAnnotationType={setSelectedAnnotationType}
          tracking={tracking}
          onStartGps={startGpsTracking}
          onStopGps={() => stopGpsTracking(true)}
          onStartSimulation={startSimulation}
          onStopSimulation={() => stopSimulation(true)}
        />

        <MapView
          draftRoute={draftRoute}
          setDraftRoute={setDraftRoute}
          drawMode={drawMode}
          annotationMode={annotationMode}
          selectedAnnotationType={selectedAnnotationType}
          onAddAnnotation={addAnnotation}
          pois={pois}
          waters={waters}
          annotations={annotations}
          routes={routes}
          trackingPath={trackingPath}
          livePosition={livePosition}
        />
      </main>
    </div>
  )
}
