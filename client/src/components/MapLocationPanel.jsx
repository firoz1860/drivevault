import React from 'react'

const cityPins = {
  'New York': {left: '66%', top: '32%'},
  'Los Angeles': {left: '18%', top: '58%'},
  Houston: {left: '48%', top: '68%'},
  Chicago: {left: '55%', top: '40%'},
}

const MapLocationPanel = ({location = 'New York', cars = [], compact = false}) => {
  const activePin = cityPins[location] || cityPins['New York']
  const visibleCars = cars.slice(0, compact ? 2 : 4)
  const googleMapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`

  return (
    <div className={`relative overflow-hidden rounded-lg border border-white/10 bg-[#0B111C] text-white ${compact ? 'h-56' : 'min-h-80'}`}>
      <iframe
        title={`Google Maps - ${location}`}
        src={googleMapsSrc}
        className='absolute inset-0 h-full w-full opacity-65'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        aria-label={`Map preview for ${location}`}
      />
      <div className='absolute inset-0 bg-gradient-to-b from-[#0B111C]/15 via-[#0B111C]/25 to-[#0B111C]/80'></div>

      {Object.entries(cityPins).map(([city, pin]) => (
        <div key={city} className='absolute z-10' style={pin}>
          <span className={`block h-3 w-3 rounded-full ${city === location ? 'bg-[#D6B25E]' : 'bg-white/40'}`}></span>
        </div>
      ))}

      <div className='absolute z-10' style={activePin}>
        <span className='absolute -left-5 -top-5 h-12 w-12 rounded-full border border-[#D6B25E]/40 animate-ping'></span>
        <span className='absolute -left-2 -top-2 h-6 w-6 rounded-full bg-[#D6B25E]/20'></span>
      </div>

      <div className='relative z-20 flex h-full flex-col justify-between p-5'>
        <div>
          <p className='text-xs uppercase tracking-[0.24em] text-[#D6B25E]'>Live pickup map</p>
          <h3 className='mt-2 text-2xl font-semibold'>{location}</h3>
          <p className='mt-1 text-sm text-white/60'>Contactless cars, pickup zones, and counter-bypass availability.</p>
        </div>

        <div className='mt-8 grid gap-2'>
          {(visibleCars.length ? visibleCars : [{brand: 'DriveVault', model: 'Showroom', location}]).map((car, index) => (
            <div key={car._id || index} className='flex items-center justify-between rounded-md border border-white/10 bg-white/8 px-3 py-2 backdrop-blur'>
              <div>
                <p className='text-sm font-medium'>{car.brand} {car.model}</p>
                <p className='text-xs text-white/50'>{car.lastKnownLocation?.address || car.location || location}</p>
              </div>
              <div className='text-right'>
                <span className='rounded-full bg-emerald-400/15 px-2 py-1 text-xs text-emerald-200'>{car.trackingStatus || 'parked'}</span>
                <p className='mt-1 text-[11px] text-white/40'>
                  {car.lastTrackedAt ? new Date(car.lastTrackedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : `${(1.4 + index * 0.8).toFixed(1)} km away`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 flex items-center justify-between gap-3 text-xs'>
          <a href={googleMapsLink} target='_blank' rel='noreferrer' className='rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white hover:bg-white/15'>
            Open in Google Maps
          </a>
          <p className='text-white/45'>Map preview is location-based and updates with the selected city or live address.</p>
        </div>
      </div>
    </div>
  )
}

export default MapLocationPanel
