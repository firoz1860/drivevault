import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'

const CarCard = ({car, compareSelected = false, onCompareToggle}) => {

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()
    const {wishlist, toggleWishlist} = useAppContext()
    const isSaved = wishlist.includes(car._id)
    const rating = ((Number(car.pricePerDay) % 7) / 10 + 4.2).toFixed(1)

  return (
    <div onClick={()=> {navigate(`/car-details/${car._id}`); scrollTo(0,0)}} className='group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer'>
      
      <div className='relative h-48 overflow-hidden'> 
        <img src={car.image} alt="Car Image" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'/>

        {car.isAvaliable && <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>Available Now</p>}

        <div className='absolute top-4 right-4 flex gap-2'>
            <button
              type='button'
              onClick={(e)=> {e.stopPropagation(); toggleWishlist(car._id)}}
              className={`min-w-12 h-8 px-2 rounded-full text-xs font-semibold shadow bg-white/90 ${isSaved ? 'text-red-500' : 'text-gray-500'}`}
              title='Save car'
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
            {onCompareToggle && (
              <button
                type='button'
                onClick={(e)=> {e.stopPropagation(); onCompareToggle(car)}}
                className={`w-8 h-8 rounded-full text-xs font-semibold shadow ${compareSelected ? 'bg-primary text-white' : 'bg-white/90 text-gray-600'}`}
                title='Compare car'
              >
                =
              </button>
            )}
        </div>

        <div className='absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg'>
            <span className='font-semibold'>{currency}{car.pricePerDay}</span>
            <span className='text-sm text-white/80'> / day</span>
        </div>
      </div>

      <div className='p-4 sm:p-5'>
        <div className='flex justify-between items-start mb-2'>
            <div>
                <h3 className='text-lg font-medium'>{car.brand} {car.model}</h3>
                <p className='text-muted-foreground text-sm'>{car.category} • {car.year}</p>
            </div>
        </div>

        <div className='flex items-center justify-between mt-3 text-xs text-gray-500'>
            <div className='flex flex-wrap gap-2'>
          <span className='px-2 py-1 rounded-full bg-green-50 text-green-700'>Verified Owner</span>
          <span className='px-2 py-1 rounded-full bg-amber-50 text-amber-700'>Fast Pickup</span>
          {car.model3d && <span className='px-2 py-1 rounded-full bg-violet-50 text-violet-700'>3D View</span>}
          {car.isContactlessEnabled !== false && <span className='px-2 py-1 rounded-full bg-cyan-50 text-cyan-700'>Contactless</span>}
          {car.isDigitalKeyEnabled !== false && <span className='px-2 py-1 rounded-full bg-amber-50 text-amber-700'>Digital Key</span>}
          <span className='px-2 py-1 rounded-full bg-slate-100 text-slate-700'>{car.trackingStatus || 'parked'}</span>
        </div>
            <span className='font-semibold text-gray-800'>{rating}/5</span>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.users_icon} alt="" className='h-4 mr-2'/>
                <span>{car.seating_capacity} Seats</span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.fuel_icon} alt="" className='h-4 mr-2'/>
                <span>{car.fuel_type}</span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.car_icon} alt="" className='h-4 mr-2'/>
                <span>{car.transmission}</span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
                <img src={assets.location_icon} alt="" className='h-4 mr-2'/>
                <span>{car.location}</span>
            </div>
        </div>

      </div>

    </div>
  )
}

export default CarCard
