import React, { useMemo, useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import {motion} from 'motion/react'
import CarModelViewer from './CarModelViewer'
import MapLocationPanel from './MapLocationPanel'

const Hero = () => {

    const [pickupLocation, setPickupLocation] = useState(cityList[0])

    const {pickupDate, setPickupDate, returnDate, setReturnDate, navigate, cars} = useAppContext()
    const heroCar = useMemo(() => cars[0] || null, [cars])

    const handleSearch = (e)=>{
        e.preventDefault()
        navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate)
    }

  return (
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
    className='min-h-screen bg-[#080A0F] text-white'>

      <div className='grid min-h-screen items-center gap-10 px-6 py-12 md:px-16 lg:grid-cols-[1fr_0.95fr] lg:px-24 xl:px-32'>
        <div>
        <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='text-xs uppercase tracking-[0.3em] text-[#D6B25E]'
        >DriveVault premium mobility</motion.p>

        <motion.h1 initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        className='mt-5 max-w-3xl text-5xl font-semibold leading-tight md:text-7xl'>Luxury cars, contactless pickup, and 3D showroom booking.</motion.h1>
        <p className='mt-5 max-w-2xl text-white/60'>Search premium cars, inspect the model, verify digitally, and unlock from the app.</p>
      
      <motion.form
      initial={{ scale: 0.95, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}

       onSubmit={handleSearch} className='mt-10 grid w-full max-w-3xl gap-4 rounded-xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur md:grid-cols-[1fr_1fr_1fr_auto]'>

            <div className='flex flex-col items-start gap-2'>
                <label className='text-xs uppercase tracking-[0.18em] text-white/40'>Location</label>
                <select required value={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)} className='w-full rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-sm text-white outline-none'>
                    <option value="">Pickup Location</option>
                    {cityList.map((city)=> <option key={city} value={city}>{city}</option>)}
                </select>
                <p className='text-sm text-white/45'>{pickupLocation ? pickupLocation : 'Please select location'}</p>
            </div>
            <div className='flex flex-col items-start gap-2'>
                <label htmlFor='pickup-date' className='text-xs uppercase tracking-[0.18em] text-white/40'>Pick-up</label>
                <input value={pickupDate} onChange={e=>setPickupDate(e.target.value)} type="date" id="pickup-date" min={new Date().toISOString().split('T')[0]} className='w-full rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-sm text-white outline-none' required/>
            </div>
            <div className='flex flex-col items-start gap-2'>
                <label htmlFor='return-date' className='text-xs uppercase tracking-[0.18em] text-white/40'>Return</label>
                <input value={returnDate} onChange={e=>setReturnDate(e.target.value)} type="date" id="return-date" className='w-full rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-sm text-white outline-none' required/>
            </div>
            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center justify-center gap-2 rounded-md bg-[#D6B25E] px-7 py-3 font-medium text-[#080A0F] cursor-pointer'>
                <img src={assets.search_icon} alt="search" className='brightness-300'/>
                Search
            </motion.button>
      </motion.form>
      <div className='mt-8 flex flex-wrap gap-3 text-sm text-white/70'>
        <span className='rounded-full border border-white/10 px-4 py-2'>Digital key</span>
        <span className='rounded-full border border-white/10 px-4 py-2'>3D showroom</span>
        <span className='rounded-full border border-white/10 px-4 py-2'>Skip counter</span>
      </div>
      </div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       transition={{ duration: 0.8, delay: 0.6 }}
      className='space-y-4'>
          <div className='overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-2xl'>
            <div className='h-80 md:h-105'>
            <CarModelViewer src={heroCar?.model3d} poster={heroCar?.image || assets.main_car} alt='Luxury rental 3D car'/>
            </div>
            <div className='grid grid-cols-3 border-t border-white/10 text-sm'>
              <div className='p-4'><p className='text-white/40'>Fleet</p><p className='font-semibold'>{cars.length || 'Live'}</p></div>
              <div className='border-x border-white/10 p-4'><p className='text-white/40'>Pickup</p><p className='font-semibold'>Contactless</p></div>
              <div className='p-4'><p className='text-white/40'>Map</p><p className='font-semibold'>Nearby</p></div>
            </div>
          </div>
        <MapLocationPanel location={pickupLocation || heroCar?.location || 'New York'} cars={cars} compact />
      </motion.div>
      </div>
    </motion.div>
  )
}

export default Hero
