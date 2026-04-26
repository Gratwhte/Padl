export function createSimulatedTrack(routePoints, onPoint, onDone, intervalMs = 1200) {
  if (!routePoints || routePoints.length === 0) return () => {}

  let index = 0
  onPoint(routePoints[0])

  const id = setInterval(() => {
    index += 1
    if (index >= routePoints.length) {
      clearInterval(id)
      onDone?.()
      return
    }
    onPoint(routePoints[index])
  }, intervalMs)

  return () => clearInterval(id)
}
