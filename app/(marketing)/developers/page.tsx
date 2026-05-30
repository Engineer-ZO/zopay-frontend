'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import DeveloperHero from '@/components/marketing/developer/developer-hero'
import IntegrationSnippets from '@/components/marketing/developer/intergration-snippets'
import ParametersDoc from '@/components/marketing/developer/parameters-doc'
import SDKsAndLibraries from '@/components/marketing/developer/sdks-libraries'
import DeveloperFAQ from '@/components/marketing/developer/developer-faq'

export default function DeveloperPage() {
  return (
    <main className="w-full">
      <DeveloperHero />
      <IntegrationSnippets />
      <ParametersDoc />
      <SDKsAndLibraries />
      <DeveloperFAQ />
      <Footer />
    </main>
  )
}
