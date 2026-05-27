import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'

const actionCards = [
  'Email notifications',
  'SMS / WhatsApp alerts',
  'Payment authorization',
  'Stripe checkout',
  'Stripe webhook',
  'Security deposit hold',
  'PDF invoice',
  'Digital agreement',
  'E-signature',
  'Modify / extend trip',
  'Cancel with policy',
  'Pickup / return reminders',
  'Notification dispatch',
  'Mobile check-in',
  'QR pickup pass',
  'Damage photos',
  'Damage report',
  'Late return automation',
  'Roadside support',
  'Favorite location',
  'Loyalty points',
  'Referral code',
  'Support ticket',
  'In-app chat',
]

const RentalSuite = () => {
  const {axios, user, currency, setShowLogin} = useAppContext()
  const primaryButton = 'inline-flex items-center justify-center rounded-md bg-[#D6B25E] px-4 py-2 text-sm font-medium text-[#080A0F] transition hover:brightness-105'
  const secondaryButton = 'inline-flex items-center justify-center rounded-md border border-[#D6B25E]/25 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#D6B25E] hover:text-[#080A0F]'
  const [suite, setSuite] = useState(null)
  const [activeBooking, setActiveBooking] = useState('')
  const [favoriteLocation, setFavoriteLocation] = useState('')
  const [supportSubject, setSupportSubject] = useState('Roadside help')
  const [supportMessage, setSupportMessage] = useState('Need assistance with my rental.')
  const [signature, setSignature] = useState(user?.name || '')
  const [promoAmount, setPromoAmount] = useState(500)
  const [promoCode, setPromoCode] = useState('DRIVE10')
  const [invoice, setInvoice] = useState(null)
  const [pickupPass, setPickupPass] = useState(null)
  const [latestAgreement, setLatestAgreement] = useState(null)
  const [chatMessage, setChatMessage] = useState('Hello, I have a question about this booking.')
  const [paymentTotals, setPaymentTotals] = useState(null)

  const bookings = useMemo(() => suite?.bookings || [], [suite])
  const currentBooking = useMemo(() => bookings.find((booking) => booking._id === activeBooking) || bookings[0] || null, [activeBooking, bookings])

  const fetchSuite = useCallback(async () => {
    if (!user) return
    const {data} = await axios.get('/api/advanced/suite')
    if (data.success) {
      setSuite(data.suite)
      setActiveBooking((current) => {
        const stillExists = data.suite.bookings.some((booking) => booking._id === current)
        return stillExists ? current : (data.suite.bookings[0]?._id || '')
      })
    } else {
      toast.error(data.message)
    }
  }, [axios, user])

  const runAction = async (type) => {
    if (!currentBooking && type !== 'profile') return toast.error('Create a booking first')
    try {
      const bookingId = currentBooking?._id
      const calls = {
        notifyEmail: () => axios.post('/api/advanced/notifications/booking', {bookingId, channel: 'email'}),
        notifySms: () => axios.post('/api/advanced/notifications/booking', {bookingId, channel: 'sms'}),
        payment: () => axios.post('/api/advanced/payments/authorize', {bookingId, provider: 'manual'}),
        checkout: () => axios.post('/api/advanced/payments/checkout-session', {bookingId, currency: 'usd'}),
        depositHold: () => axios.post('/api/advanced/payments/deposit-hold', {bookingId, currency: 'usd'}),
        dispatchNotifications: () => axios.post('/api/advanced/notifications/dispatch-due'),
        invoice: () => axios.get(`/api/advanced/invoice/${bookingId}`),
        agreement: () => axios.post('/api/advanced/agreements', {bookingId}),
        sign: async () => {
          const agreement = latestAgreement || suite?.agreements?.[0]
          if (agreement?._id) return axios.post('/api/advanced/agreements/sign', {agreementId: agreement._id, signature})
          const created = await axios.post('/api/advanced/agreements', {bookingId})
          if (created.data.success) {
            setLatestAgreement(created.data.agreement)
            return axios.post('/api/advanced/agreements/sign', {agreementId: created.data.agreement._id, signature})
          }
          return created
        },
        extend: () => axios.post('/api/advanced/bookings/extend', {bookingId, requestedReturnDate: new Date(Date.now() + 5 * 86400000)}),
        cancel: () => axios.post('/api/advanced/bookings/cancel', {bookingId, reason: 'Customer requested cancellation'}),
        pickupPass: () => axios.post('/api/advanced/bookings/pickup-pass', {bookingId}),
        document: () => axios.post('/api/advanced/documents', {type: 'license', url: 'Mobile check-in upload'}),
        damage: () => axios.post('/api/advanced/damage-reports', {bookingId, stage: 'pickup', zone: 'front bumper', severity: 'low', description: 'Photo inspection record', photos: ['inspection-photo.jpg']}),
        late: () => axios.post('/api/advanced/bookings/late-return', {bookingId, actualReturnDate: new Date(Date.now() + 7 * 86400000)}),
        support: () => axios.post('/api/advanced/support-tickets', {bookingId, category: 'roadside', subject: supportSubject, message: supportMessage}),
        chat: () => axios.post('/api/advanced/messages', {bookingId, receiver: currentBooking.owner?._id || currentBooking.owner, message: chatMessage}),
        profile: () => axios.post('/api/advanced/profile', {favoriteLocation}),
        promo: () => axios.post('/api/advanced/promos/validate', {code: promoCode, amount: promoAmount}),
      }
      if (!calls[type]) return toast.error('Unsupported action')
      const {data} = await calls[type]()
      if (data.success) {
        if (data.invoice) setInvoice(data.invoice)
        if (data.pickupPass) setPickupPass(data.pickupPass)
        if (data.agreement) setLatestAgreement(data.agreement)
        if (data.totals) setPaymentTotals(data.totals)
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
          return
        }
        toast.success(data.message || 'Action completed')
        fetchSuite()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchSuite()
  }, [fetchSuite, user])

  if (!user) {
    return (
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 min-h-[50vh]'>
        <Title title='Rental Suite' subTitle='Login to manage payments, documents, pickup pass, support, and loyalty.' align='left'/>
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
            <h1 className='text-3xl font-semibold'>Rental Suite</h1>
            <p className='mt-2 max-w-2xl text-white/65'>Payments, notifications, agreements, pickup passes, and support in one premium workflow.</p>
          </div>
          <div className='flex flex-wrap gap-2 text-xs text-white/70'>
            <span className='rounded-full border border-white/10 px-3 py-1'>Stripe</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>Invoice</span>
            <span className='rounded-full border border-white/10 px-3 py-1'>E-sign</span>
          </div>
        </div>
      </div>

      <Title title='Rental Suite' subTitle='Manage every premium rental workflow from one place.' align='left'/>

      <div className='grid lg:grid-cols-[1fr_22rem] gap-6 mt-8'>
        <section className='space-y-6'>
          <div className='border border-borderColor rounded-lg p-5 bg-white'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div>
                <h2 className='text-xl font-semibold'>Active Booking</h2>
                <p className='text-gray-500 text-sm'>Choose a booking for notifications, payment, agreement, QR pass, damage, or support.</p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs uppercase tracking-[0.2em] text-gray-400'>Booking</span>
                <select value={activeBooking} onChange={(e)=> setActiveBooking(e.target.value)} className='min-w-56 border border-borderColor rounded-md px-3 py-2 outline-none bg-white'>
                  {!bookings.length && <option value=''>No bookings</option>}
                  {bookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>{booking.car?.brand} {booking.car?.model} - {booking.status}</option>
                  ))}
                </select>
              </div>
            </div>
            {currentBooking ? (
              <div className='grid md:grid-cols-4 gap-4 mt-5 text-sm'>
                <div className='bg-light rounded-md p-3'><p className='text-gray-500'>Amount</p><p className='font-semibold'>{currency}{currentBooking.price}</p></div>
                <div className='bg-light rounded-md p-3'><p className='text-gray-500'>Payment</p><p className='font-semibold'>{currentBooking.paymentStatus}</p></div>
                <div className='bg-light rounded-md p-3'><p className='text-gray-500'>Check-in</p><p className='font-semibold'>{currentBooking.checkInStatus}</p></div>
                <div className='bg-light rounded-md p-3'><p className='text-gray-500'>Pickup pass</p><p className='font-semibold'>{currentBooking.pickupPassCode || 'Not generated'}</p></div>
              </div>
            ) : <p className='text-gray-500 mt-4'>No bookings yet.</p>}
          </div>

          <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-3'>
            <button onClick={()=> runAction('notifyEmail')} className={secondaryButton}>Queue email workflow</button>
            <button onClick={()=> runAction('notifySms')} className={secondaryButton}>Queue SMS / WhatsApp</button>
            <button onClick={()=> runAction('checkout')} className={primaryButton}>Pay now with Stripe</button>
            <button onClick={()=> runAction('depositHold')} className={secondaryButton}>Create deposit hold</button>
            <button onClick={()=> runAction('payment')} className={primaryButton}>Authorize payment + deposit</button>
            <button onClick={()=> runAction('dispatchNotifications')} className={secondaryButton}>Send due notifications</button>
            <button onClick={()=> runAction('invoice')} className={secondaryButton}>Generate invoice</button>
            <button onClick={()=> runAction('agreement')} className={secondaryButton}>Create rental agreement</button>
            <button onClick={()=> runAction('document')} className={secondaryButton}>Mobile check-in document</button>
            <button onClick={()=> runAction('pickupPass')} className={primaryButton}>Generate QR pickup pass</button>
            <button onClick={()=> runAction('extend')} className={secondaryButton}>Request trip extension</button>
            <button onClick={()=> runAction('cancel')} className={secondaryButton}>Cancel with policy</button>
            <button onClick={()=> runAction('damage')} className={secondaryButton}>Add damage inspection</button>
            <button onClick={()=> runAction('late')} className={secondaryButton}>Calculate late return</button>
            <button onClick={()=> runAction('support')} className={secondaryButton}>Open roadside/support ticket</button>
            <button onClick={()=> runAction('chat')} className={secondaryButton}>Send in-app chat</button>
          </div>

          <div className='grid md:grid-cols-2 gap-6'>
            <div className='border border-borderColor rounded-lg p-5 bg-white'>
              <h2 className='text-xl font-semibold'>Favorite Location & Referral</h2>
              <div className='flex mt-4'>
                <input value={favoriteLocation} onChange={(e)=> setFavoriteLocation(e.target.value)} placeholder='Favorite pickup city' className='min-w-0 flex-1 border border-borderColor rounded-l-md px-3 py-2 outline-none'/>
                <button onClick={()=> runAction('profile')} className='px-4 bg-[#D6B25E] text-[#080A0F] rounded-r-md font-medium'>Save</button>
              </div>
              <p className='text-sm text-gray-500 mt-3'>Points: {suite?.loyaltyPoints || 0} | Reliability: {suite?.reliabilityScore || 0}/100</p>
            </div>
            <div className='border border-borderColor rounded-lg p-5 bg-white'>
              <h2 className='text-xl font-semibold'>Promo Validation</h2>
              <div className='grid grid-cols-2 gap-2 mt-4'>
                <input value={promoCode} onChange={(e)=> setPromoCode(e.target.value.toUpperCase())} className='border border-borderColor rounded-md px-3 py-2 outline-none'/>
                <input value={promoAmount} onChange={(e)=> setPromoAmount(e.target.value)} type='number' className='border border-borderColor rounded-md px-3 py-2 outline-none'/>
              </div>
              <button onClick={()=> runAction('promo')} className='mt-3 px-4 py-2 bg-[#D6B25E] text-[#080A0F] rounded-md font-medium'>Check promo</button>
            </div>
          </div>

          <div className='border border-borderColor rounded-lg p-5 bg-white'>
            <h2 className='text-xl font-semibold'>Support & In-app Chat</h2>
            <input value={supportSubject} onChange={(e)=> setSupportSubject(e.target.value)} className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none'/>
            <textarea value={supportMessage} onChange={(e)=> setSupportMessage(e.target.value)} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none' rows={3}></textarea>
            <button onClick={()=> runAction('support')} className='px-4 py-2 bg-[#D6B25E] text-[#080A0F] rounded-md font-medium'>Create ticket</button>
            <textarea value={chatMessage} onChange={(e)=> setChatMessage(e.target.value)} className='mt-3 w-full border border-borderColor rounded-md px-3 py-2 outline-none' rows={2}></textarea>
            <button onClick={()=> runAction('chat')} className='mt-3 px-4 py-2 border border-[#D6B25E]/30 rounded-md'>Send chat message</button>
          </div>
        </section>

        <aside className='space-y-6'>
          <div className='border border-borderColor rounded-lg p-5 bg-white'>
            <h2 className='text-xl font-semibold'>Feature Coverage</h2>
            <div className='mt-4 space-y-2 max-h-96 overflow-auto text-sm'>
              {actionCards.map((item) => (
                <div key={item} className='flex justify-between gap-3 border border-borderColor rounded-md px-3 py-2'>
                  <span>{item}</span>
                  <span className='text-green-600'>Added</span>
                </div>
              ))}
            </div>
          </div>
          {pickupPass && (
            <div className='border border-borderColor rounded-lg p-5 bg-white'>
              <h2 className='text-xl font-semibold'>QR Pickup Pass</h2>
              <div className='mt-4 aspect-square bg-light rounded-lg grid place-items-center text-center p-6'>
                <div>
                  <p className='text-3xl font-bold'>{pickupPass.code}</p>
                  <p className='text-sm text-gray-500 mt-2'>{pickupPass.qrText}</p>
                </div>
              </div>
            </div>
          )}
          {invoice && (
            <div className='border border-borderColor rounded-lg p-5 bg-white text-sm'>
              <h2 className='text-xl font-semibold'>Invoice</h2>
              <p className='mt-3'>No: {invoice.invoiceNo}</p>
              <p>Car: {invoice.car}</p>
              <p>Amount: {currency}{invoice.amount}</p>
              <p>Status: {invoice.paymentStatus}</p>
            </div>
          )}
          {paymentTotals && (
            <div className='border border-borderColor rounded-lg p-5 bg-white text-sm'>
              <h2 className='text-xl font-semibold'>Dynamic Payment</h2>
              <div className='mt-3 space-y-2'>
                <p>Base: {currency}{paymentTotals.baseAmount}</p>
                <p>Service fee: {currency}{paymentTotals.serviceFee}</p>
                <p>Deposit hold: {currency}{paymentTotals.depositAmount}</p>
                <p>Discount: {currency}{paymentTotals.promoDiscount}</p>
                <p className='font-semibold'>Total: {currency}{paymentTotals.totalAmount}</p>
              </div>
            </div>
          )}
          <div className='border border-borderColor rounded-lg p-5 bg-white'>
            <h2 className='text-xl font-semibold'>E-signature</h2>
            <input value={signature} onChange={(e)=> setSignature(e.target.value)} className='mt-4 w-full border border-borderColor rounded-md px-3 py-2 outline-none'/>
            <button onClick={()=> runAction('sign')} className='mt-3 px-4 py-2 bg-[#D6B25E] text-[#080A0F] rounded-md font-medium'>Sign latest agreement</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default RentalSuite
