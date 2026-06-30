const fuelLabels = {
  unleaded93: 'Unleaded 93',
  unleaded95: 'Unleaded 95',
  diesel500: 'Diesel 500',
  diesel50: 'Diesel 50',
  lrp93: 'LRP 93'
}

const locationLabels = {
  inland: 'Inland',
  coast: 'Coast'
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.prices)) return payload.prices
  if (Array.isArray(payload?.fuel_prices)) return payload.fuel_prices
  return []
}

function parsePrice(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function getPrice(row) {
  return parsePrice(row.price ?? row.amount ?? row.value ?? row.cents_per_litre ?? row.price_cents)
}

function getFuelType(row) {
  return row.fuel_type ?? row.fuelType ?? row.type ?? row.fuel
}

function getLocation(row) {
  return row.location ?? row.region ?? row.area
}

function normalizeFuelRows(payload) {
  return asArray(payload)
    .map((row) => ({
      fuelType: getFuelType(row),
      location: getLocation(row),
      price: getPrice(row),
      raw: row
    }))
    .filter((row) => row.fuelType && row.location && row.price !== null)
}

export { fuelLabels, locationLabels, normalizeFuelRows }
