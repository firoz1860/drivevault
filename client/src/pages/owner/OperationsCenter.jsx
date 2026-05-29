import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/useAppContext'
import MapLocationPanel from '../../components/MapLocationPanel'

const OperationsCenter = () => {
  const {axios, currency} = useAppContext()
  const [operations, setOperations] = useState(null)
  const [selectedCar, setSelectedCar] = useState('')
  const [promo, setPromo] = useState({code: 'WEEKEND15', discountType: 'percent', discountValue: 15, maxUses: 50, expiresAt: '2026-12-31'})
  const [maintenance, setMaintenance] = useState({type: 'Oil change', dueDate: '2026-06-30', mileage: 10000, notes: 'Routine service'})
  const [fleet, setFleet] = useState({mileageLimit: 250, allowedRegion: 'Within city limits', lastKnownLocation: {lat: 0, lng: 0, address: 'Main branch'}})
  const [tracking, setTracking] = useState({lastKnownLocation: {lat: 0, lng: 0, address: 'Main branch'}, trackingStatus: 'parked'})
  const [smart, setSmart] = useState({
    isDigitalKeyEnabled: true,
    isContactlessEnabled: true,
    isCounterBypassEligible: true,
    protectionPlan: 'premium',
    plateNumber: 'CR-2026',
    pickupInstructions: {parkingSpot: 'A12', lockboxCode: '4821', guide: 'Parked near main gate', revealAfterVerification: true},
    ev: {batteryLevel: 85, chargingPolicy: 'Return above 70%', chargingCostPerKwh: 0.35},
    fuelPolicy: {startingLevel: 100, returnSameLevel: true, refuelChargePerPercent: 2},
  })

  const fetchOperations = useCallback(async () => {
    const {data} = await axios.get('/api/advanced/owner/operations')
    if (data.success) {
      const nextOperations = data.operations || {}
      setOperations(nextOperations)
      setSelectedCar((current) => {
        const cars = nextOperations.cars || []
        if (!cars.length) return ''
        return cars.some((car) => car._id === current) ? current : cars[0]._id
      })
    } else {
      toast.error(data.message)
    }
  }, [axios])

  useEffect(() => {
    fetchOperations()
  }, [fetchOperations])

  const cars = useMemo(() => operations?.cars || [], [operations])
  const bookings = useMemo(() => operations?.bookings || [], [operations])
  const maintenanceRecords = useMemo(() => operations?.maintenance || [], [operations])
  const promoRecords = useMemo(() => operations?.promos || [], [operations])
  const damages = useMemo(() => operations?.damages || [], [operations])
  const kpis = operations?.kpis || {}
  const selectedCarRecord = useMemo(() => cars.find((car) => car._id === selectedCar) || null, [cars, selectedCar])
  const selectedCarBookings = useMemo(() => bookings.filter((booking) => !selectedCar || booking.car?._id === selectedCar), [bookings, selectedCar])
  const calendarDays = useMemo(() => {
    const bookedRanges = selectedCarBookings.map((booking) => ({
      start: new Date(booking.pickupDate),
      end: new Date(booking.returnDate),
    }))

    const today = new Date()
    return Array.from({length: 21}, (_, index) => {
      const date = new Date(today)
      date.setHours(0, 0, 0, 0)
      date.setDate(today.getDate() + index)
      const booked = bookedRanges.some(({start, end}) => {
        const normalizedStart = new Date(start)
        normalizedStart.setHours(0, 0, 0, 0)
        const normalizedEnd = new Date(end)
        normalizedEnd.setHours(0, 0, 0, 0)
        return date >= normalizedStart && date <= normalizedEnd
      })
      return {
        label: date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
        booked,
      }
    })
  }, [selectedCarBookings])

  const addPromo = async () => {
    const {data} = await axios.post('/api/advanced/promos', promo)
    data.success ? toast.success(data.message) : toast.error(data.message)
    fetchOperations()
  }

  const addMaintenance = async () => {
    if (!selectedCar) return toast.error('Add a car first')
    const {data} = await axios.post('/api/advanced/maintenance', {...maintenance, carId: selectedCar})
    data.success ? toast.success(data.message) : toast.error(data.message)
    fetchOperations()
  }

  const updateFleet = async () => {
    if (!selectedCar) return toast.error('Add a car first')
    const {data} = await axios.post('/api/advanced/fleet-controls', {...fleet, carId: selectedCar})
    data.success ? toast.success(data.message) : toast.error(data.message)
    fetchOperations()
  }

  const updateTracking = async () => {
    if (!selectedCar) return toast.error('Add a car first')
    const {data} = await axios.post('/api/advanced/tracking/location', {...tracking, carId: selectedCar, source: 'owner-dashboard'})
    data.success ? toast.success(data.message) : toast.error(data.message)
    fetchOperations()
  }

  const updateSmart = async () => {
    if (!selectedCar) return toast.error('Add a car first')
    const {data} = await axios.post('/api/advanced/smart-mobility-settings', {carId: selectedCar, settings: smart})
    data.success ? toast.success(data.message) : toast.error(data.message)
    fetchOperations()
  }

  return (
    <div className='min-h-screen bg-[#F7F5F0] px-4 pt-10 pb-12 md:px-10 w-full'>
      <div className='mb-8 max-w-6xl rounded-2xl border border-[#D6B25E]/20 bg-[#080A0F] px-6 py-5 text-white'>
        <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault</p>
        <div className='mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold'>Operations Center</h1>
            <p className='mt-2 max-w-2xl text-white/65'>Manage fleet maintenance, promos, live tracking, smart controls, and booking health from one panel.</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='rounded-full border border-white/10 px-3 py-1'>Live tracking</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Promo campaigns</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Calendar view</span>
          </div>
        </div>
      </div>

      <Title title='Operations Center' subTitle='Manage fleet maintenance, promos, GPS placeholders, damage reports, roles, revenue, and customer operations.'/>

      <div className='grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6 max-w-5xl'>
        <div className='border border-borderColor rounded-md p-4 bg-white shadow-sm'><p className='text-gray-500 text-sm'>Revenue</p><p className='text-2xl font-semibold text-primary'>{currency}{kpis.revenue || 0}</p></div>
        <div className='border border-borderColor rounded-md p-4 bg-white shadow-sm'><p className='text-gray-500 text-sm'>Bookings</p><p className='text-2xl font-semibold'>{kpis.totalBookings || 0}</p></div>
        <div className='border border-borderColor rounded-md p-4 bg-white shadow-sm'><p className='text-gray-500 text-sm'>Cancelled</p><p className='text-2xl font-semibold'>{kpis.cancelledBookings || 0}</p></div>
        <div className='border border-borderColor rounded-md p-4 bg-white shadow-sm'><p className='text-gray-500 text-sm'>Utilization</p><p className='text-2xl font-semibold'>{kpis.utilization || 0}%</p></div>
      </div>

      <div className='grid xl:grid-cols-3 gap-6 mt-8 max-w-6xl'>
        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Fleet Maintenance Tracker</h2>
          <select value={selectedCar} onChange={(e)=> setSelectedCar(e.target.value)} className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'>
            {!cars.length && <option value=''>No cars available</option>}
            {cars.map((car)=> <option key={car._id} value={car._id}>{car.brand} {car.model}</option>)}
          </select>
          <input value={maintenance.type} onChange={(e)=> setMaintenance({...maintenance, type: e.target.value})} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <input value={maintenance.dueDate} onChange={(e)=> setMaintenance({...maintenance, dueDate: e.target.value})} type='date' className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <input value={maintenance.mileage} onChange={(e)=> setMaintenance({...maintenance, mileage: e.target.value})} type='number' className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <button onClick={addMaintenance} className='mt-3 px-4 py-2 bg-primary text-white rounded-md'>Add maintenance</button>
        </section>

        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>GPS, Geofence & Mileage</h2>
          <input value={fleet.mileageLimit} onChange={(e)=> setFleet({...fleet, mileageLimit: e.target.value})} type='number' className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <input value={fleet.allowedRegion} onChange={(e)=> setFleet({...fleet, allowedRegion: e.target.value})} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <input value={fleet.lastKnownLocation.address} onChange={(e)=> setFleet({...fleet, lastKnownLocation: {...fleet.lastKnownLocation, address: e.target.value}})} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <div className='mt-3 h-28 rounded-md bg-[#0B111C] border border-[#D6B25E]/15 relative overflow-hidden'>
            <span className='absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-primary'></span>
            <p className='absolute left-3 bottom-3 text-sm text-white/70'>{fleet.lastKnownLocation.address}</p>
          </div>
          <button onClick={updateFleet} className='mt-3 px-4 py-2 bg-primary text-white rounded-md'>Update controls</button>
          <div className='mt-6 border-t border-borderColor pt-4'>
            <h3 className='text-base font-medium'>Live Tracking Push</h3>
            <select value={tracking.trackingStatus} onChange={(e)=> setTracking({...tracking, trackingStatus: e.target.value})} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'>
              {['parked', 'idle', 'moving', 'en-route', 'delivered'].map((status)=> <option key={status} value={status}>{status}</option>)}
            </select>
            <input value={tracking.lastKnownLocation.address} onChange={(e)=> setTracking({...tracking, lastKnownLocation: {...tracking.lastKnownLocation, address: e.target.value}})} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Live address'/>
            <div className='grid grid-cols-2 gap-3 mt-3'>
              <input value={tracking.lastKnownLocation.lat} onChange={(e)=> setTracking({...tracking, lastKnownLocation: {...tracking.lastKnownLocation, lat: e.target.value}})} type='number' step='any' className='w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Latitude'/>
              <input value={tracking.lastKnownLocation.lng} onChange={(e)=> setTracking({...tracking, lastKnownLocation: {...tracking.lastKnownLocation, lng: e.target.value}})} type='number' step='any' className='w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Longitude'/>
            </div>
            <button onClick={updateTracking} className='mt-3 px-4 py-2 bg-primary text-white rounded-md'>Push live location</button>
          </div>
        </section>

        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Promo Campaign Admin</h2>
          <input value={promo.code} onChange={(e)=> setPromo({...promo, code: e.target.value.toUpperCase()})} className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <select value={promo.discountType} onChange={(e)=> setPromo({...promo, discountType: e.target.value})} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'>
            <option value='percent'>Percent</option>
            <option value='fixed'>Fixed</option>
          </select>
          <input value={promo.discountValue} onChange={(e)=> setPromo({...promo, discountValue: e.target.value})} type='number' className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <input value={promo.expiresAt} onChange={(e)=> setPromo({...promo, expiresAt: e.target.value})} type='date' className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none bg-white'/>
          <button onClick={addPromo} className='mt-3 px-4 py-2 bg-primary text-white rounded-md'>Create promo</button>
        </section>
      </div>

      <div className='border border-borderColor rounded-md p-5 mt-8 max-w-6xl bg-white shadow-sm'>
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-lg font-medium'>Smart Mobility Controls</h2>
            <p className='text-sm text-gray-500'>Toggle digital key, contactless pickup, protection plan, and pickup instructions for the selected car.</p>
          </div>
          <p className='text-xs text-gray-500'>{selectedCarRecord ? `${selectedCarRecord.brand} ${selectedCarRecord.model}` : 'No car selected'}</p>
        </div>
        <div className='grid md:grid-cols-3 gap-4 mt-4 text-sm'>
          <label className='flex items-center gap-2'><input type='checkbox' checked={smart.isDigitalKeyEnabled} onChange={(e)=> setSmart({...smart, isDigitalKeyEnabled: e.target.checked})}/> Digital key</label>
          <label className='flex items-center gap-2'><input type='checkbox' checked={smart.isContactlessEnabled} onChange={(e)=> setSmart({...smart, isContactlessEnabled: e.target.checked})}/> Contactless pickup</label>
          <label className='flex items-center gap-2'><input type='checkbox' checked={smart.isCounterBypassEligible} onChange={(e)=> setSmart({...smart, isCounterBypassEligible: e.target.checked})}/> Counter bypass</label>
          <input value={smart.plateNumber} onChange={(e)=> setSmart({...smart, plateNumber: e.target.value.toUpperCase()})} className='border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Plate number'/>
          <select value={smart.protectionPlan} onChange={(e)=> setSmart({...smart, protectionPlan: e.target.value})} className='border border-borderColor rounded-md px-3 py-2 outline-none bg-white'>
            <option value='basic'>Basic protection</option>
            <option value='standard'>Standard protection</option>
            <option value='premium'>Premium protection</option>
          </select>
          <input value={smart.pickupInstructions.parkingSpot} onChange={(e)=> setSmart({...smart, pickupInstructions: {...smart.pickupInstructions, parkingSpot: e.target.value}})} className='border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Parking spot'/>
          <input value={smart.pickupInstructions.lockboxCode} onChange={(e)=> setSmart({...smart, pickupInstructions: {...smart.pickupInstructions, lockboxCode: e.target.value}})} className='border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Lockbox code'/>
          <input value={smart.ev.batteryLevel} onChange={(e)=> setSmart({...smart, ev: {...smart.ev, batteryLevel: e.target.value}})} type='number' className='border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='EV battery'/>
          <input value={smart.fuelPolicy.startingLevel} onChange={(e)=> setSmart({...smart, fuelPolicy: {...smart.fuelPolicy, startingLevel: e.target.value}})} type='number' className='border border-borderColor rounded-md px-3 py-2 outline-none bg-white' placeholder='Fuel level'/>
        </div>
        <button onClick={updateSmart} className='mt-4 px-4 py-2 bg-primary text-white rounded-md'>Save smart controls</button>
      </div>

      <div className='grid xl:grid-cols-2 gap-6 mt-8 max-w-6xl'>
        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Vehicle Availability Calendar</h2>
          <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
            <p>{selectedCarRecord ? `${selectedCarRecord.brand} ${selectedCarRecord.model}` : 'Fleet-wide'} availability</p>
            <p>{selectedCarBookings.length} matching bookings</p>
          </div>
          <div className='grid grid-cols-3 sm:grid-cols-7 gap-2 mt-4 text-xs text-center'>
            {calendarDays.map((day)=> (
              <div key={day.label} className={`rounded-md p-2 ${day.booked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                <p>{day.label}</p>
                <p>{day.booked ? 'Booked' : 'Open'}</p>
              </div>
            ))}
          </div>
          <div className='mt-4 flex flex-wrap gap-2 text-xs'>
            <span className='rounded-full bg-red-50 px-3 py-1 text-red-600'>Booked</span>
            <span className='rounded-full bg-green-50 px-3 py-1 text-green-700'>Open</span>
          </div>
        </section>

        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Damage & Claims</h2>
          <div className='space-y-3 mt-4 max-h-56 overflow-auto'>
            {damages.map((damage)=> (
              <div key={damage._id} className='border border-borderColor rounded-md p-3 text-sm'>
                <p className='font-medium'>{damage.zone} - {damage.severity}</p>
                <p className='text-gray-500'>{damage.description}</p>
              </div>
            ))}
            {damages.length === 0 && <p className='text-gray-500 text-sm'>No damage reports yet.</p>}
          </div>
        </section>
      </div>

      <div className='grid lg:grid-cols-2 gap-6 mt-8 max-w-6xl'>
        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Recent Maintenance</h2>
          <div className='space-y-3 mt-4 max-h-64 overflow-auto text-sm'>
            {maintenanceRecords.map((item) => (
              <div key={item._id} className='border border-borderColor rounded-md p-3'>
                <p className='font-medium'>{item.car?.brand} {item.car?.model}</p>
                <p className='text-gray-500'>{item.type} | Due {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'n/a'}</p>
              </div>
            ))}
            {maintenanceRecords.length === 0 && <p className='text-gray-500 text-sm'>No maintenance records yet.</p>}
          </div>
        </section>
        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Active Promo Codes</h2>
          <div className='space-y-3 mt-4 max-h-64 overflow-auto text-sm'>
            {promoRecords.map((item) => (
              <div key={item._id} className='border border-borderColor rounded-md p-3'>
                <p className='font-medium'>{item.code}</p>
                <p className='text-gray-500'>
                  {item.discountType === 'percent' ? `${item.discountValue}% off` : `${currency}${item.discountValue} off`} | Uses {item.usedCount}/{item.maxUses}
                </p>
              </div>
            ))}
            {promoRecords.length === 0 && <p className='text-gray-500 text-sm'>No promo campaigns yet.</p>}
          </div>
        </section>
      </div>

      <div className='grid lg:grid-cols-3 gap-6 mt-8 max-w-6xl'>
        {['Role-based admin panel', 'Customer reliability score', 'Owner verification', 'Support tickets', 'In-app chat logs', 'Lost payment/refund review'].map((item)=> (
          <div key={item} className='border border-borderColor rounded-md p-4 bg-white shadow-sm'>
            <p className='font-medium'>{item}</p>
            <p className='text-sm text-gray-500 mt-1'>Operational workflow added to the platform layer.</p>
          </div>
        ))}
      </div>

      <div className='grid lg:grid-cols-2 gap-6 mt-8 max-w-6xl'>
        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Live Fleet Map</h2>
          <div className='mt-4'>
            <MapLocationPanel location={selectedCarRecord?.lastKnownLocation?.address || operations?.liveLocations?.[0]?.location || 'New York'} cars={operations?.liveLocations || []} />
          </div>
        </section>
        <section className='border border-borderColor rounded-md p-5 bg-white shadow-sm'>
          <h2 className='text-lg font-medium'>Tracked Cars</h2>
          <div className='mt-4 space-y-3 max-h-80 overflow-auto'>
            {(operations?.liveLocations || []).map((car) => (
              <div key={car._id} className='border border-borderColor rounded-md p-3 text-sm'>
                <p className='font-medium'>{car.brand} {car.model}</p>
                <p className='text-gray-500'>{car.location}</p>
                <p className='mt-1 text-xs text-gray-500'>Status: {car.trackingStatus} | History: {car.historyCount}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default OperationsCenter
