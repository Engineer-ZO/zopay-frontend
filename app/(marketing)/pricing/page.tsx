'use client'

import Header from '@/components/header'
import PricingHero from '@/components/marketing/pricing/pricing-hero'
import PricingCards from '@/components/marketing/pricing/pricing-cards'
import TransactionFees from '@/components/marketing/pricing/transaction-fees'
import PricingCalculator from '@/components/marketing/pricing/pricing-calculator'
import PricingComparison from '@/components/marketing/pricing/pricing-comparison'
import PricingFAQ from '@/components/marketing/pricing/pricing-faq'
import Footer from '@/components/footer'

export default function PricingPage() {
  return (
    <main className="w-full">
      <PricingHero />
      <PricingCards />
      <TransactionFees />
      <PricingCalculator />
      <PricingComparison />
      <PricingFAQ />
      <Footer />
    </main>
  )
}
