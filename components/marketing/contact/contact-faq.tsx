'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    category: 'Technical',
    questions: [
      {
        q: 'How do I integrate ZOPAY APIs?',
        a: 'Our comprehensive API documentation includes code examples in multiple languages. Visit docs.zopay.com to get started with step-by-step guides and sample implementations.',
      },
      {
        q: 'What are the transaction limits?',
        a: 'Transaction limits depend on your account tier. Starter accounts have basic limits, while Professional and Enterprise accounts enjoy higher limits. Contact our sales team for custom limits.',
      },
      {
        q: 'Do you support webhooks?',
        a: 'Yes, we fully support webhooks for real-time transaction notifications. You can configure and manage webhooks from your dashboard.',
      },
      {
        q: 'What is your API uptime guarantee?',
        a: 'We maintain 99.9% uptime SLA for all API endpoints. Enterprise customers also receive dedicated support and monitoring.',
      },
    ],
  },
  {
    category: 'Commercial',
    questions: [
      {
        q: 'What payment methods do you support?',
        a: 'We support Mobile Money (MTN, Orange), Visa, Mastercard, Bank Transfers, and International payments across 50+ African countries.',
      },
      {
        q: 'What are your pricing details?',
        a: 'Pricing varies by payment method: Mobile Money (1.5% + 50 XAF), Cards (2.9% + 100 XAF), Bank Transfers (1.0% + 200 XAF), International (3.5% + 200 XAF). View our pricing page for more details.',
      },
      {
        q: 'Do you offer custom enterprise solutions?',
        a: 'Yes! Our Enterprise plan offers custom pricing, dedicated account management, and tailored solutions for large-scale operations.',
      },
      {
        q: 'How long does onboarding take?',
        a: 'Startup accounts can be created in minutes. Verification typically takes 24-48 hours. Enterprise clients have a dedicated onboarding specialist.',
      },
      {
        q: 'Can I get a volume discount?',
        a: 'Absolutely. We offer competitive volume discounts for merchants processing high transaction volumes. Contact our sales team for custom pricing.',
      },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'Is my data secure?',
        a: 'We use bank-level encryption (TLS 1.3) and comply with international security standards. All data is stored securely with regular security audits.',
      },
      {
        q: 'What compliance standards do you follow?',
        a: 'We comply with PCI DSS, GDPR, and local African regulations. Our Enterprise clients receive compliance reports on demand.',
      },
      {
        q: 'How can I reset my password?',
        a: 'Use the "Forgot Password" link on the login page. You\'ll receive a reset link via email. For security, links expire after 24 hours.',
      },
    ],
  },
]

export default function ContactFAQ() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Find answers to common questions about ZOPAY
          </p>
        </div>

        <div className="space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-foreground">
                <div className="h-1 w-8 rounded-full bg-accent"></div>
                {section.category}
              </h3>
              <div className="space-y-4">
                {section.questions.map((item, idx) => {
                  const itemId = `${section.category}-${idx}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <div
                      key={itemId}
                      className="rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-accent/50"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                      >
                        <span className="text-left font-semibold text-foreground">{item.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-accent flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-border bg-muted/5 px-6 py-5">
                          <p className="text-foreground/80 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-foreground/70 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Contact our support team directly.
          </p>
          <a
            href="#contact-form"
            className="inline-block px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  )
}
