// Map a real DriveVault car document to the spec-reveal panel model.
// Missing values are omitted (never invented or defaulted to fake specs).

export function buildSpecModel(car, currency = '') {
  if (!car) return { title: 'Vehicle', subtitle: '', price: null, rows: [] }

  const rows = []
  const push = (label, value) => {
    if (value !== undefined && value !== null && value !== '') rows.push({ label, value: String(value) })
  }

  push('SEATS', car.seating_capacity ? `${car.seating_capacity} seats` : '')
  push('FUEL', car.fuel_type)
  push('TRANSMISSION', car.transmission)
  push('CATEGORY', car.category)
  push('YEAR', car.year)
  push('LOCATION', car.location)
  push('MILEAGE LIMIT', car.mileageLimit ? `${car.mileageLimit} km/day` : '')
  push('PROTECTION', car.protectionPlan ? `${car.protectionPlan} plan` : '')

  return {
    title: [car.brand, car.model].filter(Boolean).join(' ') || 'Vehicle',
    subtitle: [car.category, car.year].filter(Boolean).join(' · '),
    // pricePerDay shown explicitly as a DAILY rental price by the overlay.
    price: car.pricePerDay != null && car.pricePerDay !== '' ? `${currency}${car.pricePerDay}` : null,
    rows: rows.slice(0, 6),
  }
}
