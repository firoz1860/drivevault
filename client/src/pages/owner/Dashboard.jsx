import React, { useCallback, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {

  const {axios, isOwner, currency} = useAppContext()
  const statCard = 'flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor bg-white'

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    {title: "Total Cars", value: data.totalCars, icon: assets.carIconColored},
    {title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored},
    {title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored},
    {title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored},
  ]

  const revenueBars = [42, 58, 36, 74, 62, 88]
  const confirmedRate = data.totalBookings ? Math.round((data.completedBookings / data.totalBookings) * 100) : 0
  const pendingRate = data.totalBookings ? Math.round((data.pendingBookings / data.totalBookings) * 100) : 0

  const fetchDashboardData = useCallback(async ()=>{
    try {
       const { data } = await axios.get('/api/owner/dashboard')
       if (data.success){
        setData(data.dashboardData)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  useEffect(()=>{
    if(isOwner){
      fetchDashboardData()
    }
  },[isOwner, fetchDashboardData])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <div className='mb-8 rounded-2xl border border-[#D6B25E]/20 bg-[#080A0F] px-6 py-5 text-white max-w-6xl'>
        <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault</p>
        <div className='mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold'>Admin Dashboard</h1>
            <p className='mt-2 max-w-2xl text-white/65'>Monitor cars, bookings, revenue, and recent platform activity from a premium control surface.</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='rounded-full border border-white/10 px-3 py-1'>Revenue trend</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Booking health</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Fleet ops</span>
          </div>
        </div>
      </div>

      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities"/>

      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index)=>(
          <div key={index} className={`${statCard} shadow-sm`}>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4'/>
            </div>
          </div>
        ))}
      </div>


      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* recent booking  */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full bg-white shadow-sm'>
          <h1 className='text-lg font-medium'>Recent Bookings</h1>
          <p className='text-gray-500'>Latest customer bookings</p>
          {data.recentBookings.length === 0 && <p className='mt-4 text-sm text-gray-500'>No bookings yet.</p>}
          {data.recentBookings.map((booking, index)=>(
            <div key={index} className='mt-4 flex items-center justify-between'>

              <div className='flex items-center gap-2'>
                <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                  <img src={assets.listIconColored} alt="" className='h-5 w-5'/>
                </div>
                <div>
                  <p>{booking.car.brand} {booking.car.model}</p>
                  <p className='text-sm text-gray-500'>{booking.createdAt.split('T')[0]}</p>
                </div>
              </div>

              <div className='flex items-center gap-2 font-medium'>
                <p className='text-sm text-gray-500'>{currency}{booking.price}</p>
                <p className='px-3 py-0.5 border border-borderColor rounded-full text-sm'>{booking.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* monthly revenue */}
        <div className='p-4 md:p-6 mb-6 border border-borderColor rounded-md w-full md:max-w-xs bg-white shadow-sm'>
          <h1 className='text-lg font-medium'>Monthly Revenue</h1>
          <p className='text-gray-500'>Revenue for current month</p>
          <p className='text-3xl mt-6 font-semibold text-primary'>{currency}{data.monthlyRevenue}</p>
        </div>
        
      </div>

      <div className='grid lg:grid-cols-3 gap-6 mb-10 max-w-5xl'>
        <div className='p-4 md:p-6 border border-borderColor rounded-md lg:col-span-2 bg-white shadow-sm'>
          <h1 className='text-lg font-medium'>Revenue Trend</h1>
          <p className='text-gray-500'>Last 6 months performance preview</p>
          <div className='flex items-end gap-3 h-40 mt-6'>
            {revenueBars.map((height, index)=> (
              <div key={index} className='flex-1 flex flex-col items-center gap-2'>
                <div className='w-full bg-primary/15 rounded-t-md flex items-end' style={{height: `${height}%`}}>
                  <div className='w-full bg-primary rounded-t-md' style={{height: `${Math.max(28, height - 16)}%`}}></div>
                </div>
                <span className='text-xs text-gray-500'>M{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='p-4 md:p-6 border border-borderColor rounded-md bg-white shadow-sm'>
          <h1 className='text-lg font-medium'>Booking Health</h1>
          <div className='space-y-4 mt-5'>
            <div>
              <div className='flex justify-between text-sm'><span>Confirmed rate</span><span>{confirmedRate}%</span></div>
              <div className='h-2 bg-light rounded-full mt-2'><div className='h-2 bg-green-500 rounded-full' style={{width: `${confirmedRate}%`}}></div></div>
            </div>
            <div>
              <div className='flex justify-between text-sm'><span>Pending review</span><span>{pendingRate}%</span></div>
              <div className='h-2 bg-light rounded-full mt-2'><div className='h-2 bg-amber-500 rounded-full' style={{width: `${pendingRate}%`}}></div></div>
            </div>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div className='bg-light rounded-md p-3'>
                <p className='text-gray-500'>Top car</p>
                <p className='font-medium'>{data.recentBookings[0]?.car?.brand || 'No data'} {data.recentBookings[0]?.car?.model || ''}</p>
              </div>
              <div className='bg-light rounded-md p-3'>
                <p className='text-gray-500'>Cancel risk</p>
                <p className='font-medium'>Low</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}

export default Dashboard
