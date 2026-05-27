import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const MyBookings = () => {
  const { axios, user, currency } = useAppContext()
  const primaryButton = 'inline-flex items-center justify-center rounded-md bg-[#D6B25E] px-4 py-2 text-sm font-medium text-[#080A0F] transition hover:brightness-105'
  const [bookings, setBookings] = useState([])

  const getExtraDayCost = (booking) => Math.round(Number(booking.car.pricePerDay || 0) * 1.15)

  const fetchMyBookings = async ()=> {
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success){
        setBookings(data.bookings)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    user && fetchMyBookings()
  },[user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'
    >
      <div className='mb-8 rounded-2xl border border-[#D6B25E]/20 bg-[#080A0F] px-6 py-5 text-white'>
        <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault</p>
        <div className='mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold'>My Bookings</h1>
            <p className='mt-2 max-w-2xl text-white/65'>Review trips, pickup windows, payment state, and return status from one place.</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='rounded-full border border-white/10 px-3 py-1'>Contactless</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Digital key</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Trip timeline</span>
          </div>
        </div>
      </div>

      <Title title='My Bookings' subTitle='View and manage your all car bookings' align="left"/>

      <div>
        {bookings.map((booking, index)=>(
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            key={booking._id}
            className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12 bg-white'
          >
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover'/>
              </div>
              <p className='text-lg font-medium mt-2'>{booking.car.brand} {booking.car.model}</p>
              <p className='text-gray-500'>{booking.car.year} | {booking.car.category} | {booking.car.location}</p>
            </div>

            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index+1}</p>
                <p className={`px-3 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-400/15 text-green-600' : 'bg-red-400/15 text-red-600'}`}>{booking.status}</p>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-1'/>
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  <p>{booking.car.location}</p>
                </div>
              </div>

              <div className='grid grid-cols-4 gap-2 mt-5 text-center text-xs'>
                {['Pending', 'Confirmed', 'Picked Up', 'Completed'].map((step, stepIndex)=> (
                  <div key={step} className='flex flex-col items-center gap-1'>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${booking.status === 'confirmed' && stepIndex < 2 ? 'bg-primary text-white' : stepIndex === 0 ? 'bg-primary text-white' : 'bg-light text-gray-500'}`}>{stepIndex + 1}</span>
                    <span className='text-gray-500'>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                <p>Booked on {booking.createdAt.split('T')[0]}</p>
                <p className='mt-3'>Extra day: {currency}{getExtraDayCost(booking)}</p>
                <button className={primaryButton}>Rate car</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default MyBookings
