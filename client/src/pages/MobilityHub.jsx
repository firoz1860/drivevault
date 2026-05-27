import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Title from '../components/Title'
import CarModelViewer from '../components/CarModelViewer'
import { useAppContext } from '../context/AppContext'

const checklistFields = [
  ['licenseUploaded', 'License'],
  ['selfieUploaded', 'Selfie'],
  ['agreementSigned', 'Agreement'],
  ['paymentComplete', 'Payment'],
  ['damagePhotosComplete', '360 photos'],
]

const MobilityHub = () => {
  const {axios, user, setShowLogin, currency, navigate} = useAppContext()
  const primaryButton = 'inline-flex items-center justify-center rounded-md bg-[#D6B25E] px-4 py-2 text-sm font-medium text-[#080A0F] transition hover:brightness-105'
  const secondaryButton = 'inline-flex items-center justify-center rounded-md border border-[#D6B25E]/25 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#D6B25E] hover:text-[#080A0F]'
  const [hub, setHub] = useState(null)
  const [activeBooking, setActiveBooking] = useState('')
  const [plate, setPlate] = useState('')
  const [days, setDays] = useState(3)
  const [comparison, setComparison] = useState([])
  const [airport, setAirport] = useState({terminal: 'Terminal 1', flightNumber: '', flightDelayMinutes: 0})
  const [inspectionNote, setInspectionNote] = useState('clean')

  const bookings = useMemo(() => hub?.bookings || [], [hub])
  const radarCars = useMemo(() => hub?.radarCars || [], [hub])
  const booking = useMemo(() => bookings.find((item) => item._id === activeBooking) || bookings[0], [activeBooking, bookings])

  const fetchHub = async () => {
    if (!user) return
    const {data} = await axios.get('/api/advanced/experience-hub')
    if (data.success) {
      setHub(data.hub)
      setActiveBooking((current) => current || data.hub.bookings[0]?._id || '')
    } else {
      toast.error(data.message)
    }
  }

  const call = async (type) => {
    if (!booking && !['compare'].includes(type)) return toast.error('Create a booking first')
    try {
      const bookingId = booking?._id
      const calls = {
        contactless: () => axios.post('/api/advanced/bookings/contactless', {bookingId, licenseUploaded: true, selfieUploaded: true, agreementSigned: true, paymentComplete: true, damagePhotosComplete: true}),
        unlock: () => axios.post('/api/advanced/bookings/digital-key/unlock', {bookingId}),
        inspect: () => axios.post('/api/advanced/inspections', {bookingId, stage: 'pickup', plateNumber: plate, zones: ['front', 'rear', {name: 'left', note: inspectionNote}, 'right', 'interior', 'dashboard', 'tires'], signature: user?.name}),
        airport: () => axios.post('/api/advanced/bookings/airport', {bookingId, ...airport}),
        extend: () => axios.post('/api/advanced/bookings/instant-extend', {bookingId, requestedReturnDate: new Date(Date.now() + 7 * 86400000)}),
        compare: () => axios.post('/api/advanced/trip-costs/compare', {carIds: radarCars.slice(0, 3).map((car) => car._id), days}),
      }
      const {data} = await calls[type]()
      if (data.success) {
        if (data.comparisons) setComparison(data.comparisons)
        toast.success(data.message || 'Updated')
        fetchHub()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchHub()
  }, [user])

  if (!user) {
    return (
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 min-h-[50vh]'>
        <Title title='Mobility Hub' subTitle='Login to use contactless pickup, digital key, radar map, and inspections.' align='left'/>
        <button onClick={() => setShowLogin(true)} className='px-5 py-2 bg-primary text-white rounded-md'>Login</button>
      </div>
    )
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 pb-16'>
      <div className='mb-8 rounded-2xl border border-[#D6B25E]/20 bg-[#080A0F] px-6 py-5 text-white'>
        <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault</p>
        <div className='mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold'>Mobility Hub</h1>
            <p className='mt-2 max-w-2xl text-white/65'>Contactless pickup, radar map, inspection flow, and live trip controls.</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='rounded-full border border-white/10 px-3 py-1'>Live radar</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Pickup pass</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>3D showroom</span>
          </div>
        </div>
      </div>

      <Title title='Mobility Hub' subTitle='Contactless pickup, digital key, car radar, 360 inspection, airport flow, and smart trip cost.' align='left'/>

      <div className='grid xl:grid-cols-[1fr_24rem] gap-6 mt-8'>
        <section className='space-y-6'>
          <div className='grid md:grid-cols-3 gap-4'>
            <div className='border border-borderColor rounded-lg p-5 md:col-span-2'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
                <div>
                  <h2 className='text-xl font-semibold'>Contactless Pickup</h2>
                  <p className='text-sm text-gray-500'>Complete checks, reveal pickup pass, then unlock digitally.</p>
                </div>
                <select value={activeBooking} onChange={(e)=> setActiveBooking(e.target.value)} className='border border-borderColor rounded-md px-3 py-2 outline-none'>
                  {!bookings.length && <option value=''>No bookings</option>}
                  {bookings.map((item)=> <option key={item._id} value={item._id}>{item.car?.brand} {item.car?.model} - {item.status}</option>)}
                </select>
              </div>
              {booking ? (
                <>
                  <div className='grid sm:grid-cols-5 gap-2 mt-5 text-sm'>
                    {checklistFields.map(([key, label])=> (
                      <div key={key} className={`rounded-md p-3 text-center ${booking.contactless?.[key] ? 'bg-green-50 text-green-700' : 'bg-light text-gray-500'}`}>
                        <p>{label}</p>
                        <p className='text-xs'>{booking.contactless?.[key] ? 'Done' : 'Pending'}</p>
                      </div>
                    ))}
                  </div>
                  <div className='flex flex-wrap gap-3 mt-5'>
                    <button onClick={()=> call('contactless')} className={primaryButton}>Complete checklist</button>
                    <button onClick={()=> call('unlock')} className={secondaryButton}>Unlock car</button>
                    <button onClick={()=> call('extend')} className={secondaryButton}>Instant extend</button>
                  </div>
                </>
              ) : <p className='text-gray-500 mt-4'>No bookings yet.</p>}
            </div>
            <div className='border border-borderColor rounded-lg p-5'>
              <h2 className='text-xl font-semibold'>Digital Key</h2>
              <div className='mt-5 rounded-full aspect-square bg-light border border-borderColor grid place-items-center text-center'>
                <div>
                  <p className='text-3xl font-semibold'>{booking?.digitalKey?.status || 'locked'}</p>
                  <p className='text-sm text-gray-500 mt-2'>App unlock simulation</p>
                </div>
              </div>
            </div>
          </div>

          <div className='border border-borderColor rounded-lg p-5'>
            <h2 className='text-xl font-semibold'>Car Radar & Map-first Browsing</h2>
            <div className='grid md:grid-cols-3 gap-4 mt-4'>
              {radarCars.slice(0, 6).map((car)=> (
                <button key={car._id} onClick={()=> navigate(`/car-details/${car._id}`)} className='text-left border border-borderColor rounded-lg overflow-hidden hover:border-primary'>
                  <img src={car.image} alt='' className='h-32 w-full object-cover'/>
                  <div className='p-3'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-sm text-gray-500'>{car.insights?.distanceKm} km away - {car.location}</p>
                    <div className='flex flex-wrap gap-1 mt-2 text-xs'>
                      {car.insights?.trustBadges?.slice(0, 3).map((badge)=> <span key={badge} className='px-2 py-1 bg-light rounded-full'>{badge}</span>)}
                    </div>
                  </div>
                </button>
              ))}
              {radarCars.length === 0 && (
                <div className='md:col-span-3 rounded-lg border border-dashed border-borderColor bg-light p-6 text-center text-gray-500'>
                  No radar cars yet. Add a car as owner to populate nearby pickup zones.
                </div>
              )}
            </div>
          </div>

          <div className='grid lg:grid-cols-2 gap-6'>
            <div className='border border-borderColor rounded-lg p-5'>
              <h2 className='text-xl font-semibold'>360 Inspection & AI Damage UI</h2>
              <input value={plate} onChange={(e)=> setPlate(e.target.value.toUpperCase())} placeholder='Plate number' className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none'/>
              <select value={inspectionNote} onChange={(e)=> setInspectionNote(e.target.value)} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none'>
                <option value='clean'>Clean</option>
                <option value='small scratch on left door'>Possible scratch</option>
                <option value='dent near rear bumper'>Dent</option>
              </select>
              <div className='grid grid-cols-4 gap-2 mt-4 text-xs text-center'>
                {['Front', 'Rear', 'Left', 'Right', 'Interior', 'Dash', 'Tires', 'Signature'].map((zone)=> <div key={zone} className='bg-light rounded-md p-2'>{zone}</div>)}
              </div>
              <button onClick={()=> call('inspect')} className='mt-4 px-4 py-2 bg-[#D6B25E] text-[#080A0F] rounded-md font-medium'>Save inspection</button>
            </div>

            <div className='border border-borderColor rounded-lg p-5'>
              <h2 className='text-xl font-semibold'>Airport Pickup</h2>
              <select value={airport.terminal} onChange={(e)=> setAirport({...airport, terminal: e.target.value})} className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none'>
                {(hub?.airportTerminals || []).map((terminal)=> <option key={terminal} value={terminal}>{terminal}</option>)}
              </select>
              <input value={airport.flightNumber} onChange={(e)=> setAirport({...airport, flightNumber: e.target.value.toUpperCase()})} placeholder='Flight number' className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none'/>
              <input value={airport.flightDelayMinutes} onChange={(e)=> setAirport({...airport, flightDelayMinutes: e.target.value})} type='number' placeholder='Delay minutes' className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none'/>
              <button onClick={()=> call('airport')} className='mt-4 px-4 py-2 bg-[#D6B25E] text-[#080A0F] rounded-md font-medium'>Update airport flow</button>
            </div>
          </div>
        </section>

        <aside className='space-y-6'>
          <div className='border border-borderColor rounded-lg overflow-hidden'>
            <div className='h-72'>
              <CarModelViewer src={radarCars[0]?.model3d} poster={radarCars[0]?.image} alt='3D showroom car'/>
            </div>
            <div className='p-5'>
              <h2 className='text-xl font-semibold'>3D Showroom</h2>
              <p className='text-sm text-gray-500 mt-1'>Rotate, zoom, inspect, then compare real trip cost.</p>
            </div>
          </div>

          <div className='border border-borderColor rounded-lg p-5'>
            <h2 className='text-xl font-semibold'>Trip Cost Compare</h2>
            <input value={days} onChange={(e)=> setDays(e.target.value)} type='number' className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none'/>
            <button onClick={()=> call('compare')} className='mt-3 px-4 py-2 bg-[#D6B25E] text-[#080A0F] rounded-md font-medium'>Compare top cars</button>
            <div className='space-y-3 mt-4'>
              {comparison.map(({car, cost})=> (
                <div key={car._id} className='border border-borderColor rounded-md p-3 text-sm'>
                  <p className='font-medium'>{car.brand} {car.model}</p>
                  <p>Total: {currency}{cost.totalTripCost}</p>
                  <p className='text-gray-500'>Deposit: {currency}{cost.deposit} | Fuel/charge: {currency}{cost.fuelOrChargeEstimate}</p>
                </div>
              ))}
              {comparison.length === 0 && (
                <p className='text-sm text-gray-500'>Run comparison to see total trip price, deposit, and fuel or charging estimate.</p>
              )}
            </div>
          </div>

          <div className='border border-borderColor rounded-lg p-5'>
            <h2 className='text-xl font-semibold'>Unique Coverage</h2>
            <div className='mt-4 space-y-2 text-sm'>
              {['Digital key', 'Contactless pickup', 'Car radar', 'Geofence map', 'Plate search', '360 inspection', 'Damage dispute timeline', 'Selfie/license check', 'Trip photo vault', 'AI damage labels', 'Protection plans', 'Smart pricing', 'Subscription rentals', 'EV policies', 'Fuel policy', 'Pickup instructions', 'Lockbox reveal', 'Skip counter', 'Return score', 'Trust score'].map((item)=> (
                <div key={item} className='flex justify-between border border-borderColor rounded-md px-3 py-2'>
                  <span>{item}</span>
                  <span className='text-green-600'>Added</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default MobilityHub
