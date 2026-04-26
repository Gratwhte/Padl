export function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function polylineDistanceKm(points) {
  if (!points || points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i])
  }
  return total
}

export function estimateDurationHours(distanceKm, speedKmh = 5) {
  if (!speedKmh) return 0
  return distanceKm / speedKmh
}

function pointToSegmentDistanceApprox(point, a, b) {
  const px = point[1], py = point[0]
  const ax = a[1], ay = a[0]
  const bx = b[1], by = b[0]

  const dx = bx - ax
  const dy = by - ay
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay)

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

export function routeWaterWarning(routePoints, waters) {
  if (!routePoints || routePoints.length < 2) return null

  const threshold = 0.03

  for (const point of routePoints) {
    let nearAnyWater = false

    for (const water of waters) {
      for (let i = 1; i < water.centerline.length; i++) {
        const dist = pointToSegmentDistanceApprox(
          point,
          water.centerline[i - 1],
          water.centerline[i]
        )
        if (dist < threshold) {
          nearAnyWater = true
          break
        }
      }
      if (nearAnyWater) break
    }

    if (!nearAnyWater) {
      return 'Warning: parts of this route may leave mapped water corridors.'
    }
  }

  return null
}

export function formatDuration(hours) {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} min`
  return `${h} h ${m} min`
}
