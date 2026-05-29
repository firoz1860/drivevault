import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/useAppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import CarModelViewer, { DEFAULT_CAR_MODEL } from '../components/CarModelViewer'
import MapLocationPanel from '../components/MapLocationPanel'

const CarDetails = () => {
  const {id} = useParams()
  const {cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate} = useAppContext()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [licenseName, setLicenseName] = useState('')
  const [show3d, setShow3d] = useState(true)
  const currency = import.meta.env.VITE_CURRENCY
  const model3dUrl = car?.model3d || DEFAULT_CAR_MODEL

  const priceSummary = useMemo(() => {
    if (!car || !pickupDate || !returnDate) return {days: 1, base: Number(car?.pricePerDay || 0), fees: 0, discount: 0, total: Number(car?.pricePerDay || 0)}
    const picked = new Date(pickupDate)
    const returned = new Date(returnDate)
    const days = Math.max(1, Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)))
    const base = Number(car.pricePerDay) * days
    const fees = Math.round(base * 0.08)
    const discount = promoCode.trim().toUpperCase() === 'DRIVE10' ? Math.round(base * 0.1) : 0
    return {days, base, fees, discount, total: base + fees - discount}
  }, [car, pickupDate, returnDate, promoCode])

  const availabilityDays = useMemo(() => {
    const today = new Date()
    return Array.from({length: 14}, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index)
      return {
        label: date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
        unavailable: car ? (index + Number(car.pricePerDay)) % 5 === 0 : false,
      }
    })
  }, [car])

  const handleSubmit = async (e)=> {
    e.preventDefault()
    try {
      const {data} = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate,
        returnDate
      })

      if (data.success){
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    setCar(cars.find(car => car._id === id))
  },[cars, id])

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65'/>
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='lg:col-span-2'
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='rounded-xl mb-6 shadow-md overflow-hidden bg-light'
          >
            <div className='flex items-center justify-between px-4 py-3 bg-white border-b border-borderColor'>
              <p className='font-medium'>{show3d ? 'Interactive 3D Preview' : 'Vehicle Preview'}</p>
              <button type='button' onClick={()=> setShow3d(!show3d)} className='px-3 py-1.5 border border-borderColor rounded-md text-sm'>
                {show3d ? 'Show Image' : 'Show 3D'}
              </button>
            </div>
            <div className='h-72 md:h-110'>
              {show3d ? (
                <CarModelViewer src={model3dUrl} poster={car.image} alt={`${car.brand} ${car.model} 3D model`} />
              ) : (
                <img src={car.image} alt="" className='w-full h-full object-cover'/>
              )}
            </div>
          </motion.div>

          <motion.div
            className='space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} | {car.year}</p>
              <div className='flex flex-wrap gap-2 mt-3 text-xs'>
                {(car.isDigitalKeyEnabled !== false) && <span className='px-3 py-1 rounded-full bg-amber-50 text-amber-700'>Digital key</span>}
                {(car.isContactlessEnabled !== false) && <span className='px-3 py-1 rounded-full bg-cyan-50 text-cyan-700'>Contactless pickup</span>}
                {(car.isCounterBypassEligible !== false) && <span className='px-3 py-1 rounded-full bg-amber-50 text-amber-700'>Skip counter</span>}
                <span className='px-3 py-1 rounded-full bg-green-50 text-green-700'>{car.protectionPlan || 'standard'} protection</span>
              </div>
            </div>
            <hr className='border-borderColor my-6'/>

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                {icon: assets.users_icon, text: `${car.seating_capacity} Seats`},
                {icon: assets.fuel_icon, text: car.fuel_type},
                {icon: assets.car_icon, text: car.transmission},
                {icon: assets.location_icon, text: car.location},
              ].map(({icon, text})=>(
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  key={text}
                  className='flex flex-col items-center bg-light p-4 rounded-lg'
                >
                  <img src={icon} alt="" className='h-5 mb-2'/>
                  {text}
                </motion.div>
              ))}
            </div>

            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>

            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item)=>(
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className='grid md:grid-cols-3 gap-4'>
              <div className='border border-borderColor rounded-lg p-4'>
                <h1 className='text-lg font-medium'>Pickup Instructions</h1>
                <p className='text-gray-500 text-sm mt-2'>{car.pickupInstructions?.guide || 'Contactless guide appears after verification.'}</p>
                <p className='text-sm mt-3'>Spot: {car.pickupInstructions?.parkingSpot || 'Assigned after booking'}</p>
              </div>
              <div className='border border-borderColor rounded-lg p-4'>
                <h1 className='text-lg font-medium'>Fuel / Battery</h1>
                <p className='text-gray-500 text-sm mt-2'>{car.fuel_type === 'Electric' ? `Battery target ${car.ev?.batteryLevel || 80}%` : `Return fuel at ${car.fuelPolicy?.startingLevel || 100}%`}</p>
                <p className='text-sm mt-3'>Policy: {car.fuel_type === 'Electric' ? car.ev?.chargingPolicy || 'Return charged' : 'Return same level'}</p>
              </div>
              <div className='border border-borderColor rounded-lg p-4'>
                <h1 className='text-lg font-medium'>Driving Zone</h1>
                <p className='text-gray-500 text-sm mt-2'>{car.allowedRegion || 'Local metro region'}</p>
                <p className='text-sm mt-3'>Mileage: {car.mileageLimit || 250} km/day</p>
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='border border-borderColor rounded-lg p-4'>
                <h1 className='text-xl font-medium mb-3'>Availability Calendar</h1>
                <div className='grid grid-cols-4 sm:grid-cols-7 gap-2 text-sm'>
                  {availabilityDays.map((day) => (
                    <div key={day.label} className={`p-2 rounded-md text-center ${day.unavailable ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>
                      <p>{day.label}</p>
                      <p className='text-xs'>{day.unavailable ? 'Booked' : 'Open'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='border border-borderColor rounded-lg p-4'>
                <h1 className='text-xl font-medium mb-3'>Pickup Map</h1>
                <MapLocationPanel location={car.lastKnownLocation?.address || car.location} cars={[car]} compact />
                <div className='mt-3 flex flex-wrap gap-2 text-xs'>
                  <span className='px-3 py-1 rounded-full bg-slate-100 text-slate-700'>{car.trackingStatus || 'parked'}</span>
                  <span className='px-3 py-1 rounded-full bg-slate-100 text-slate-700'>{car.lastKnownLocation?.address || car.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h1 className='text-xl font-medium mb-3'>Reviews</h1>
              <div className='grid md:grid-cols-3 gap-3'>
                {['Smooth pickup and clean car.', 'Owner responded fast.', 'Perfect for a weekend trip.'].map((review, index)=> (
                  <div key={review} className='border border-borderColor rounded-lg p-4'>
                    <p className='font-semibold'>{(4.8 - index / 10).toFixed(1)}/5</p>
                    <p className='text-gray-500 text-sm mt-2'>{review}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onSubmit={handleSubmit}
          className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500 bg-white'
        >
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
            {currency}{car.pricePerDay}
            <span className='text-base text-gray-400 font-normal'>per day</span>
          </p>

          <hr className='border-borderColor my-6'/>

          <div className='flex flex-col gap-2'>
            <label htmlFor="pickup-date">Pickup Date</label>
            <input
              value={pickupDate}
              onChange={(e)=>setPickupDate(e.target.value)}
              type="date"
              className='border border-borderColor px-3 py-2 rounded-lg'
              required
              id='pickup-date'
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input
              value={returnDate}
              onChange={(e)=>setReturnDate(e.target.value)}
              type="date"
              className='border border-borderColor px-3 py-2 rounded-lg'
              required
              id='return-date'
            />
          </div>

          <div className='border border-borderColor rounded-lg p-4 space-y-2 text-sm'>
            <div className='flex justify-between'><span>{priceSummary.days} day rental</span><span>{currency}{priceSummary.base}</span></div>
            <div className='flex justify-between'><span>Service fee</span><span>{currency}{priceSummary.fees}</span></div>
            <div className='flex justify-between text-green-600'><span>Promo discount</span><span>-{currency}{priceSummary.discount}</span></div>
            <div className='flex justify-between font-semibold text-gray-800 border-t border-borderColor pt-2'><span>Estimated total</span><span>{currency}{priceSummary.total}</span></div>
          </div>

          <div className='flex'>
            <input
              value={promoCode}
              onChange={(e)=> setPromoCode(e.target.value.toUpperCase())}
              placeholder='Coupon code'
              className='min-w-0 flex-1 border border-borderColor rounded-l-lg px-3 py-2 outline-none'
            />
            <button type='button' className='px-4 py-2 bg-light border border-l-0 border-borderColor rounded-r-lg'>Apply</button>
          </div>

          <label className='border border-dashed border-borderColor rounded-lg p-3 cursor-pointer text-sm block'>
            <input type='file' className='hidden' onChange={(e)=> setLicenseName(e.target.files[0]?.name || '')}/>
            <span className='font-medium text-gray-700'>Driving license</span>
            <p className='text-gray-500'>{licenseName || 'Upload before owner approval'}</p>
          </label>

          <div className='grid grid-cols-4 gap-2 text-center text-xs'>
            {['Pending', 'Confirmed', 'Picked Up', 'Completed'].map((step, index)=> (
              <div key={step} className='flex flex-col items-center gap-1'>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center ${index === 0 ? 'bg-primary text-white' : 'bg-light text-gray-500'}`}>{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Book Now</button>
          <p className='text-center text-sm'>No credit card required to reserve</p>
        </motion.form>
      </div>
    </div>
  ) : <Loader />
}

export default CarDetails
