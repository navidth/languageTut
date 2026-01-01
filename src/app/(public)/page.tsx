import AboutSection from '@/components/landing/AboutSection'
import HeroSplit from '@/components/landing/HeroSplit'
import SiteFooter from '@/components/landing/SiteFooter'
import WhyUsSection from '@/components/landing/WhyUsSection'
import React from 'react'

const page = () => {
  return (
    <div className='h-screen' >
      <HeroSplit />
      <AboutSection />
      <WhyUsSection />
      <SiteFooter />
    </div>
  )
}

export default page