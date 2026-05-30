'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle. No cancellation fees.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! We offer 20% discount if you pay annually. Contact our sales team for custom pricing on large volumes.',
  },
  {
    question: 'Are there any setup fees?',
    answer: 'No, there are no setup fees. You can start using ZOPAY immediately after signing up. Only pay for what you use.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including credit/debit cards, bank transfers, and mobile money. You can add a payment method to your account settings.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for annual plans. For monthly plans, you can cancel anytime with no penalties.',
  },
  {
    question: 'Can I integrate ZOPAY with my existing system?',
    answer: 'Absolutely! Our API is developer-friendly and well-documented. Professional and Enterprise plans include dedicated integration support.',
  },
  {
    question: 'What happens if my usage exceeds my plan limits?',
    answer: 'We\'ll notify you before your plan limits are reached. You can upgrade anytime or contact us for a custom plan that fits your needs.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes, the Starter plan is completely free. Professional plan includes a 14-day free trial. Enterprise plans are custom, contact sales for details.',
  },
]

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-muted/30 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pricing FAQ
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Have questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card transition-all duration-300 hover:border-accent/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-foreground">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-accent transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="border-t border-border px-6 py-4">
                  <p className="text-foreground/70">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-accent/20 bg-accent/5 p-6 text-center">
          <p className="text-foreground mb-4">
            Still have questions? Our team is here to help.
          </p>
          <button className="inline-flex items-center rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition-all hover:bg-accent/90">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}
