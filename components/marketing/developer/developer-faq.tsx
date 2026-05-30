'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    id: 1,
    question: 'How do I get my API keys?',
    answer: 'You can generate API keys from your ZOPAY dashboard under Settings > API Keys. You will get both public and secret keys. Always keep your secret key confidential and never expose it in client-side code.'
  },
  {
    id: 2,
    question: 'What is the difference between public and secret keys?',
    answer: 'Public keys are used in client-side code to initiate payments and can be safely shared. Secret keys are used for server-side operations like verifying payments and should never be exposed. Treat your secret key like a password.'
  },
  {
    id: 3,
    question: 'Which payment methods do you support?',
    answer: 'ZOPAY supports multiple payment methods: Mobile Money (MTN, Orange Money), Credit/Debit Cards (Visa, Mastercard), Bank Transfers, and International payments. All transactions are processed in XAF (Central African Franc).'
  },
  {
    id: 4,
    question: 'How do I handle payment webhooks?',
    answer: 'When a payment is completed, we send a webhook notification to your configured webhook URL. Your server should verify the signature using your secret key and update your database accordingly. See the webhook documentation for detailed implementation guide.'
  },
  {
    id: 5,
    question: 'What is the transaction fee structure?',
    answer: 'Fees vary by payment method: Mobile Money (1.5% + 50 XAF), Cards (2.9% + 100 XAF), Bank Transfer (1.0% + 200 XAF), International (3.5% + 200 XAF). Use the fee calculator on our pricing page to see exact charges.'
  },
  {
    id: 6,
    question: 'How long does it take for funds to settle?',
    answer: 'Settlement times vary by payment method: Mobile Money (instant), Cards (1-2 business days), Bank Transfers (2-3 business days). International payments may take 3-5 business days depending on destination country.'
  },
  {
    id: 7,
    question: 'Do you support refunds?',
    answer: 'Yes, we support full and partial refunds. Refunds can be initiated through the dashboard or API. Mobile Money refunds are processed instantly, while card refunds may take 1-2 business days to appear in customer accounts.'
  },
  {
    id: 8,
    question: 'What security measures are in place?',
    answer: 'All transactions are encrypted using TLS 1.2+. We comply with PCI DSS standards for card payments. We also support 3D Secure for enhanced fraud prevention. All sensitive data is encrypted both in transit and at rest.'
  },
  {
    id: 9,
    question: 'How do I test the integration?',
    answer: 'Use test mode by switching to test keys in your dashboard. Test mode allows you to simulate payments without charging real money. Use test reference numbers starting with "test_" to ensure test transactions are marked correctly.'
  },
  {
    id: 10,
    question: 'What are the minimum and maximum transaction amounts?',
    answer: 'Minimum transaction amount is 100 XAF. Maximum limits depend on the payment method and customer account type. Mobile Money typically allows up to 5,000,000 XAF per transaction. Contact support for higher limits.'
  }
]

export default function DeveloperFAQ() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <section className="bg-muted/20 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Developer FAQ
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Common questions about integration and API usage
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-border rounded-lg overflow-hidden bg-background">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between bg-card hover:bg-muted/30 transition-colors px-6 py-5"
              >
                <h3 className="text-left text-lg font-semibold text-foreground">{faq.question}</h3>
                <ChevronDown
                  className={`h-5 w-5 text-foreground/60 flex-shrink-0 ml-4 transition-transform ${
                    expandedId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === faq.id && (
                <div className="border-t border-border bg-muted/20 px-6 py-5">
                  <p className="text-foreground/80 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Need More Help?</h3>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Our developer support team is here to help. Check out our detailed documentation or reach out through our support channels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90">
              Contact Developer Support
            </button>
            <button className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-all hover:bg-primary/10">
              Browse Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
