import AboutSection from '@/components/landing/AboutSection'
import HeroSplit from '@/components/landing/HeroSplit'
import WhyUsSection from '@/components/landing/WhyUsSection'
import UserTypeSection from '@/components/landing/UserTypeSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TrustSection from '@/components/landing/TrustSection'
import FinalCTASection from '@/components/landing/FinalCTASection'

const page = () => {
  return (
    < >
      <HeroSplit />
      <UserTypeSection />
      <WhyUsSection />
      <HowItWorksSection />
      <TrustSection />
      <AboutSection />
      <FinalCTASection/>
    </>
  )
}

export default page