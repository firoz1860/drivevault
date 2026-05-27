import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import MapLocationPanel from '../components/MapLocationPanel'

const Cars = () => {

  // getting search params from url
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const {cars, axios, wishlist} = useAppContext()

  const [input, setInput] = useState('')
  const [category, setCategory] = useState('')
  const [fuelType, setFuelType] = useState('')
  const [transmission, setTransmission] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [compareCars, setCompareCars] = useState([])

  const isSearchData = pickupLocation && pickupDate && returnDate
  const [filteredCars, setFilteredCars] = useState([])

  const applyFilter = async ()=>{
     
    const filtered = cars.slice().filter((car)=>{
      const matchesText = car.brand.toLowerCase().includes(input.toLowerCase())
      || car.model.toLowerCase().includes(input.toLowerCase())  
      || car.category.toLowerCase().includes(input.toLowerCase())  
      || car.transmission.toLowerCase().includes(input.toLowerCase())
      const matchesCategory = !category || car.category === category
      const matchesFuel = !fuelType || car.fuel_type === fuelType
      const matchesTransmission = !transmission || car.transmission === transmission
      const matchesPrice = !maxPrice || Number(car.pricePerDay) <= Number(maxPrice)
      const matchesSaved = !savedOnly || wishlist.includes(car._id)

      return matchesText && matchesCategory && matchesFuel && matchesTransmission && matchesPrice && matchesSaved
    })
    setFilteredCars(filtered)
  }

  const toggleCompare = (car) => {
    setCompareCars((prev) => {
      if (prev.some((item) => item._id === car._id)) {
        return prev.filter((item) => item._id !== car._id)
      }
      return prev.length < 3 ? [...prev, car] : prev
    })
  }

  const searchCarAvailablity = async () =>{
    const {data} = await axios.post('/api/bookings/check-availability', {location: pickupLocation, pickupDate, returnDate})
    if (data.success) {
      setFilteredCars(data.availableCars)
      if(data.availableCars.length === 0){
        toast('No cars available')
      }
      return null
    }
  }

  useEffect(()=>{
    isSearchData && searchCarAvailablity()
  },[])

  useEffect(()=>{
    cars.length > 0 && !isSearchData && applyFilter()
  },[input, cars, category, fuelType, transmission, maxPrice, savedOnly, wishlist])

  return (
    <div>

      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}

      className='bg-[#080A0F] px-6 py-16 text-white md:px-16 lg:px-24 xl:px-32'>
        <div className='mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
          <div>
            <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>Map-first fleet</p>
            <h1 className='mt-4 text-4xl font-semibold md:text-5xl'>Find your next car by location, readiness, and total trip fit.</h1>
            <p className='mt-4 text-white/60'>Filter the fleet, compare cars, and see pickup zones before opening details.</p>
          </div>
          <MapLocationPanel location={pickupLocation || 'New York'} cars={filteredCars.length ? filteredCars : cars} />
        </div>

        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}

        className='mx-auto mt-8 flex h-12 w-full max-w-3xl items-center rounded-md border border-white/10 bg-white/10 px-4 shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2'/>

          <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder='Search by make, model, or features' className='w-full h-full bg-transparent outline-none text-white placeholder:text-white/45'/>

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 ml-2'/>
        </motion.div>
      </motion.div>

      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-8'>
        <div className='max-w-7xl mx-auto border border-borderColor rounded-lg p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3'>
          <select value={category} onChange={(e)=> setCategory(e.target.value)} className='border border-borderColor rounded-md px-3 py-2 outline-none text-gray-600'>
            <option value=''>All categories</option>
            <option value='Sedan'>Sedan</option>
            <option value='SUV'>SUV</option>
            <option value='Van'>Van</option>
          </select>
          <select value={fuelType} onChange={(e)=> setFuelType(e.target.value)} className='border border-borderColor rounded-md px-3 py-2 outline-none text-gray-600'>
            <option value=''>All fuels</option>
            <option value='Gas'>Gas</option>
            <option value='Diesel'>Diesel</option>
            <option value='Petrol'>Petrol</option>
            <option value='Electric'>Electric</option>
            <option value='Hybrid'>Hybrid</option>
          </select>
          <select value={transmission} onChange={(e)=> setTransmission(e.target.value)} className='border border-borderColor rounded-md px-3 py-2 outline-none text-gray-600'>
            <option value=''>All transmissions</option>
            <option value='Automatic'>Automatic</option>
            <option value='Manual'>Manual</option>
            <option value='Semi-Automatic'>Semi-Automatic</option>
          </select>
          <input value={maxPrice} onChange={(e)=> setMaxPrice(e.target.value)} type='number' placeholder='Max daily price' className='border border-borderColor rounded-md px-3 py-2 outline-none text-gray-600'/>
          <label className='flex items-center gap-2 border border-borderColor rounded-md px-3 py-2 text-gray-600'>
            <input type='checkbox' checked={savedOnly} onChange={(e)=> setSavedOnly(e.target.checked)}/>
            Saved only
          </label>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}

      className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredCars.length} Cars</p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredCars.map((car, index)=> (
            <motion.div key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CarCard car={car} compareSelected={compareCars.some((item) => item._id === car._id)} onCompareToggle={toggleCompare}/>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {compareCars.length > 0 && (
        <div className='fixed left-4 right-4 bottom-4 z-30 bg-white border border-borderColor rounded-lg shadow-xl p-4 max-w-5xl mx-auto'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='font-semibold'>Compare cars</h3>
            <button onClick={()=> setCompareCars([])} className='text-sm text-gray-500'>Clear</button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mt-3'>
            {compareCars.map((car) => (
              <div key={car._id} className='border border-borderColor rounded-md p-3 text-sm'>
                <p className='font-medium'>{car.brand} {car.model}</p>
                <p className='text-gray-500'>{car.category} - {car.year}</p>
                <p className='mt-2'>Price: {import.meta.env.VITE_CURRENCY}{car.pricePerDay}/day</p>
                <p>Seats: {car.seating_capacity}</p>
                <p>Fuel: {car.fuel_type}</p>
                <p>Location: {car.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default Cars
