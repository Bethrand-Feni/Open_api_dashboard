const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

const endpoints = {
  allFuel: '/fuel/all',
  fuelByTypeLocation: (fuelType, location) => `/fuel/${fuelType}/${location}`,
  allNews: '/news',
  newsByFuelType: (fuelType) => `/news/${fuelType}`
}

function buildUrl(path) {
  return `${baseUrl}${path}`
}

async function request(path) {
  if (!baseUrl) {
    throw new Error('Missing VITE_API_BASE_URL. Add it to .env before running API calls.')
  }

  const response = await fetch(buildUrl(path))
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || payload?.error
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return payload
}

export { baseUrl, buildUrl, endpoints, request }
