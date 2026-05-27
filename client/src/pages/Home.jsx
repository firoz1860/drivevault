import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import UniqueDriveTools from '../components/UniqueDriveTools'
import TemplateExperienceShowcase from '../components/TemplateExperienceShowcase'

const Home = () => {
  return (
    <>
      <Hero />
      <TemplateExperienceShowcase />
      <UniqueDriveTools />
      <FeaturedSection />
      <Banner />
      <Testimonial />
      <Newsletter />
    </>
  )
}

export default Home
