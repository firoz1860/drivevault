import React, { useMemo, useState } from 'react'
import { cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import CarModelViewer, { DEFAULT_CAR_MODEL } from './CarModelViewer'

const tripProfiles = {
  Family: {category: 'SUV', copy: 'More seats, luggage room, and comfort for longer drives.'},
  Business: {category: 'Sedan', copy: 'Clean executive cars with easy pickup and quiet cabins.'},
  Wedding: {category: 'SUV', copy: 'Premium looking cars for special arrivals and photos.'},
  Airport: {category: 'Sedan', copy: 'Fast pickup options with simple luggage-friendly choices.'},
}

const UniqueDriveTools = () => {
  const {cars, currency, navigate} = useAppContext()
  const [tripType, setTripType] = useState('Family')
  const [pickup, setPickup] = useState(cityList[0])
  const [promo, setPromo] = useState('')
  const [licenseName, setLicenseName] = useState('')

  const recommendedCars = useMemo(() => {
    const profile = tripProfiles[tripType]
    const matches = cars.filter((car) => car.category === profile.category || car.location === pickup)
    return (matches.length ? matches : cars).slice(0, 3)
  }, [cars, pickup, tripType])

  return (
    <section className='px-6 md:px-16 lg:px-24 xl:px-32 py-16 bg-white'>
      <div className='max-w-7xl mx-auto grid lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 border border-borderColor rounded-lg p-5'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-semibold'>Smart Trip Planner</h2>
              <p className='text-gray-500 mt-1'>Choose the trip mood and get matched cars instantly.</p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {Object.keys(tripProfiles).map((item) => (
                <button
                  key={item}
                  onClick={() => setTripType(item)}
                  className={`px-4 py-2 rounded-full border text-sm ${tripType === item ? 'bg-primary text-white border-primary' : 'border-borderColor text-gray-600'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className='grid md:grid-cols-3 gap-4 mt-6'>
            <div className='bg-light rounded-lg p-4'>
              <p className='text-sm text-gray-500'>Suggested style</p>
              <h3 className='text-lg font-semibold mt-1'>{tripProfiles[tripType].category}</h3>
              <p className='text-sm text-gray-500 mt-2'>{tripProfiles[tripType].copy}</p>
            </div>
            <div className='bg-light rounded-lg p-4'>
              <p className='text-sm text-gray-500'>Pickup map</p>
              <select value={pickup} onChange={(e) => setPickup(e.target.value)} className='mt-2 w-full bg-white border border-borderColor rounded-md px-3 py-2 outline-none'>
                {cityList.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              <div className='mt-3 h-20 rounded-md bg-white border border-borderColor relative overflow-hidden'>
                <span className='absolute left-6 top-6 w-3 h-3 rounded-full bg-primary'></span>
                <span className='absolute right-10 top-10 w-3 h-3 rounded-full bg-green-500'></span>
                <span className='absolute left-1/2 bottom-4 w-3 h-3 rounded-full bg-amber-500'></span>
              </div>
            </div>
            <div className='bg-light rounded-lg p-4'>
              <p className='text-sm text-gray-500'>Coupon preview</p>
              <div className='flex mt-2'>
                <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder='DRIVE10' className='min-w-0 flex-1 border border-borderColor rounded-l-md px-3 py-2 outline-none bg-white'/>
                <button className='px-3 py-2 bg-primary text-white rounded-r-md'>Apply</button>
              </div>
              <p className='text-sm text-green-600 mt-2'>{promo ? 'Preview discount active' : 'Try DRIVE10'}</p>
            </div>
          </div>

          <div className='grid md:grid-cols-3 gap-4 mt-6'>
            {recommendedCars.map((car) => (
              <button key={car._id} onClick={() => navigate(`/car-details/${car._id}`)} className='text-left border border-borderColor rounded-lg p-3 hover:border-primary transition'>
                <img src={car.image} alt='' className='w-full h-28 object-cover rounded-md'/>
                <p className='font-medium mt-3'>{car.brand} {car.model}</p>
                <p className='text-sm text-gray-500'>{currency}{car.pricePerDay}/day in {car.location}</p>
              </button>
            ))}
          </div>
        </div>

        <div className='border border-borderColor rounded-lg p-5'>
          <h2 className='text-2xl font-semibold'>Ready-to-rent profile</h2>
          <p className='text-gray-500 mt-1'>Show customers premium checks before checkout.</p>
          <div className='mt-5 space-y-3 text-sm'>
            {['Verified owner badge', 'Sanitized car promise', 'Fast pickup window', 'License document check'].map((item) => (
              <div key={item} className='flex items-center justify-between border border-borderColor rounded-md px-3 py-2'>
                <span>{item}</span>
                <span className='text-green-600'>Enabled</span>
              </div>
            ))}
          </div>
          <label className='block mt-5 border border-dashed border-borderColor rounded-lg p-4 cursor-pointer'>
            <input type='file' className='hidden' onChange={(e) => setLicenseName(e.target.files[0]?.name || '')}/>
            <span className='text-sm font-medium'>Upload driving license</span>
            <p className='text-sm text-gray-500 mt-1'>{licenseName || 'Frontend preview only'}</p>
          </label>
          <div className='mt-5 rounded-lg overflow-hidden border border-borderColor h-56'>
            <CarModelViewer src={DEFAULT_CAR_MODEL} poster={recommendedCars[0]?.image} alt='3D rental car preview' />
          </div>
        </div>
      </div>
    </section>
  )
}

export default UniqueDriveTools
