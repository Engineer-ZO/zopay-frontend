'use client'

import Header from '@/components/header'
import Hero from '@/components/hero'
import Features from '@/components/features'
import TechStack from '@/components/tech-stack'
import DeveloperSection from '@/components/developer-section'
import GetStarted from '@/components/get-started'
import FAQ from '@/components/faq'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <Features />
      <TechStack />
      <DeveloperSection />
      <GetStarted />
      <FAQ />
      <Footer />
    </main>
  )
}
