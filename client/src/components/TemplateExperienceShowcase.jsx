import React from 'react'
import { useAppContext } from '../context/useAppContext'
import CarModelViewer from './CarModelViewer'
import MapLocationPanel from './MapLocationPanel'

const templates = [
  ['Dark Luxury Showroom', '3D hero, gold accents, concierge tone.'],
  ['Map-first Mobility', 'Radar browsing with nearby pickup zones.'],
  ['Contactless Pickup', 'Verify, pay, inspect, unlock, return.'],
  ['3D Garage', 'Interactive model preview and showroom controls.'],
  ['Fleet SaaS Dashboard', 'Revenue, utilization, maintenance, claims.'],
  ['Airport Concierge', 'Terminal pickup, flight delay adjustment.'],
  ['EV-first Rental', 'Battery, charging policy, range confidence.'],
  ['Marketplace Trust', 'Host badges, protection plans, reviews.'],
]

const TemplateExperienceShowcase = () => {
  const {cars, navigate} = useAppContext()
  const heroCar = cars[0]

  return (
    <section className='bg-[#080A0F] px-6 py-20 text-white md:px-16 lg:px-24 xl:px-32'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center'>
          <div>
            <p className='text-xs uppercase tracking-[0.28em] text-[#D6B25E]'>DriveVault design system</p>
            <h2 className='mt-4 max-w-3xl text-4xl font-semibold md:text-5xl'>A luxury rental interface built around showroom, map, and contactless pickup.</h2>
            <p className='mt-5 max-w-2xl text-white/60'>This turns the fork away from a tutorial layout into a premium mobility product: 3D car inspection, live pickup context, trust badges, EV policy, and an owner command center.</p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <button onClick={() => navigate('/mobility-hub')} className='rounded-md bg-[#D6B25E] px-5 py-3 font-medium text-[#080A0F]'>Open Mobility Hub</button>
              <button onClick={() => navigate('/cars')} className='rounded-md border border-white/15 px-5 py-3 text-white'>Browse Fleet</button>
            </div>
          </div>

          <div className='overflow-hidden rounded-lg border border-white/10 bg-white/5'>
            <div className='h-80'>
              <CarModelViewer src={heroCar?.model3d} poster={heroCar?.image} alt='DriveVault showroom car'/>
            </div>
            <div className='grid grid-cols-3 border-t border-white/10 text-sm'>
              <div className='p-4'><p className='text-white/50'>Unlock</p><p className='font-semibold'>Digital key</p></div>
              <div className='border-x border-white/10 p-4'><p className='text-white/50'>Pickup</p><p className='font-semibold'>Contactless</p></div>
              <div className='p-4'><p className='text-white/50'>Plan</p><p className='font-semibold'>Premium</p></div>
            </div>
          </div>
        </div>

        <div className='mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {templates.map(([title, copy]) => (
            <div key={title} className='rounded-lg border border-white/10 bg-white/5 p-5'>
              <p className='text-sm font-semibold text-[#D6B25E]'>{title}</p>
              <p className='mt-2 text-sm text-white/60'>{copy}</p>
            </div>
          ))}
        </div>

        <div className='mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
          <MapLocationPanel location={heroCar?.location || 'New York'} cars={cars}/>
          <div className='rounded-lg border border-white/10 bg-white/5 p-5'>
            <h3 className='text-2xl font-semibold'>Premium pickup timeline</h3>
            <div className='mt-6 grid gap-3'>
              {['Search nearby cars', 'Verify license and selfie', 'Pay and sign agreement', 'Inspect 360 photos', 'Unlock with digital key', 'Return with condition score'].map((step, index) => (
                <div key={step} className='flex items-center gap-3 rounded-md border border-white/10 bg-[#0B111C] p-3'>
                  <span className='grid h-8 w-8 place-items-center rounded-full bg-[#D6B25E] text-sm font-semibold text-[#080A0F]'>{index + 1}</span>
                  <span className='text-sm text-white/75'>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TemplateExperienceShowcase
