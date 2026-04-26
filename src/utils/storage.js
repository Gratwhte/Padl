const KEYS = {
  routes: 'wsdemo_routes',
  annotations: 'wsdemo_annotations',
  activities: 'wsdemo_activities'
}

export function loadStored(key, fallback = []) {
  try {
    const raw = localStorage.getItem(KEYS[key])
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveStored(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data))
}

export function exportAllData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'watersport-demo-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
