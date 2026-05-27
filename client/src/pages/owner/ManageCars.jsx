import React, { useCallback, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ManageCars = () => {

  const {isOwner, axios, currency} = useAppContext()
  const [cars, setCars] = useState([])

  const fetchOwnerCars = useCallback(async ()=> {
    try {
      const {data} = await axios.get('/api/owner/cars')
      if (data.success){
        setCars(data.cars)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  const toggleAvailability = async (carId)=> {
    try {
      const {data} = await axios.post('/api/owner/toggle-car', {carId})
      if (data.success){
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteCar = async (carId)=> {
    try {
      const confirm = window.confirm('Are you sure you want to delete this car?')
      if (!confirm) return null

      const {data} = await axios.post('/api/owner/delete-car', {carId})
      if (data.success){
        toast.success(data.message)
        fetchOwnerCars()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=> {
    isOwner && fetchOwnerCars()
  }, [isOwner, fetchOwnerCars])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <div className='mb-8 rounded-2xl border border-[#D6B25E]/20 bg-[#080A0F] px-6 py-5 text-white max-w-6xl'>
        <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault</p>
        <div className='mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold'>Manage Cars</h1>
            <p className='mt-2 max-w-2xl text-white/65'>Review listed cars, availability state, 3D readiness, and live tracking at a glance.</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='rounded-full border border-white/10 px-3 py-1'>3D Ready</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Live status</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Premium fleet</span>
          </div>
        </div>
      </div>

      <Title title="Manage Cars" subTitle="View all listed cars, update their details, or remove them from the booking platform."/>

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500 bg-white'>
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium max-md:hidden">3D</th>
              <th className="p-3 font-medium max-md:hidden">Live</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {cars.length === 0 && (
              <tr>
                <td className='p-4 text-gray-500' colSpan={7}>No cars listed yet.</td>
              </tr>
            )}
            {cars.map((car, index)=>(
              <tr key={index} className='border-t border-borderColor'>
                <td className='p-3 flex items-center gap-3'>
                  <img src={car.image} alt="" className="h-12 w-12 aspect-square rounded-md object-cover"/>
                  <div className='max-md:hidden'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500'>{car.seating_capacity} | {car.transmission}</p>
                  </div>
                </td>

                <td className='p-3 max-md:hidden'>{car.category}</td>
                <td className='p-3'>{currency}{car.pricePerDay}/day</td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.isAvaliable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {car.isAvaliable ? "Available" : "Unavailable" }
                  </span>
                </td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.model3d ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {car.model3d ? "3D Ready" : "Image only"}
                  </span>
                </td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.trackingStatus ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'}`}>
                    {car.trackingStatus || 'parked'}
                  </span>
                </td>

                <td className='flex items-center p-3'>
                  <img onClick={()=> toggleAvailability(car._id)} src={car.isAvaliable ? assets.eye_close_icon : assets.eye_icon} alt="" className='cursor-pointer'/>
                  <img onClick={()=> deleteCar(car._id)} src={assets.delete_icon} alt="" className='cursor-pointer'/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageCars
