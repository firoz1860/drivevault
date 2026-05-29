import React from 'react'
import { Link } from 'react-router-dom'

const pageContent = {
  about: {
    title: 'About Us',
    subtitle: 'DriveVault is a premium car rental experience focused on clean design, fast booking, contactless pickup, and clear trip controls.',
    body: [
      'Browse verified cars, compare trip cost, and manage pickup or return steps from one place.',
      'Owners get live fleet tools, booking visibility, maintenance controls, and location tracking.',
    ],
  },
  help: {
    title: 'Help Center',
    subtitle: 'Find answers for booking, payment, pickup, cancellation, documents, and owner listing flows.',
    body: [
      'Use Mobility Hub for digital key, contactless pickup, inspection, and airport flow.',
      'Use Rental Suite to manage payment, invoices, and trip status after booking.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Basic platform terms for booking, cancellation, owner approval, and responsible vehicle use.',
    body: [
      'Bookings are subject to car availability, document checks, payment status, and owner rules.',
      'Users are responsible for fuel, mileage, return condition, and late fees where applicable.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'We keep this simple: user data is used for bookings, communication, owner operations, and platform safety.',
    body: [
      'Account, booking, and payment records are used to power the rental workflow and notifications.',
      'Image uploads, location info, and tracking fields are only used for rental operations and support.',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    subtitle: 'Cookies are used for login state, preferences, and a smoother booking experience.',
    body: [
      'We use basic session and preference storage to keep users logged in and remember UI choices.',
      'Analytics and product cookies are only used to improve booking flow and page performance.',
    ],
  },
  insurance: {
    title: 'Insurance',
    subtitle: 'Protection plans and coverage terms for renters and owners.',
    body: [
      'Cars can expose protection-plan tiers, deposit hold logic, damage reports, and return-condition scoring.',
      'Owners can configure maintenance, claims, and trip protection handling from the operations panel.',
    ],
  },
  contact: {
    title: 'Contact',
    subtitle: 'Reach the DriveVault team for support, partnerships, or fleet onboarding.',
    body: [
      'Email: mepersonalfiroz@gmail.com',
      'Phone: +1 234 567890',
      'Address: 1234 Luxury Drive, San Francisco, CA 94107',
    ],
  },
}

const InfoPage = ({ page }) => {
  const content = pageContent[page] || pageContent.help

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-16'>
      <div className='max-w-3xl'>
        <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault</p>
        <h1 className='mt-4 text-4xl font-semibold'>{content.title}</h1>
        <p className='mt-3 text-gray-600'>{content.subtitle}</p>

        <div className='mt-8 space-y-4 rounded-2xl border border-borderColor bg-white p-6 shadow-sm'>
          {content.body.map((item) => (
            <p key={item} className='text-gray-600 leading-relaxed'>
              {item}
            </p>
          ))}
        </div>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link to='/' className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-[#080A0F] hover:bg-primary-dull transition-all'>
            Back home
          </Link>
          {page === 'contact' ? (
            <a href='mailto:mepersonalfiroz@gmail.com' className='inline-flex items-center justify-center rounded-md border border-borderColor px-4 py-2 font-medium text-gray-700 hover:border-primary transition-all'>
              Email support
            </a>
          ) : (
            <Link to='/cars' className='inline-flex items-center justify-center rounded-md border border-borderColor px-4 py-2 font-medium text-gray-700 hover:border-primary transition-all'>
              Browse cars
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfoPage
