'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Which countries and mobile money providers do you support?',
    answer: 'We support payments from 15+ African countries including Ghana, Nigeria, Kenya, Uganda, Tanzania, and more. Our platform integrates with all major mobile money providers including MTN Money, Airtel Money, Vodafone Cash, Safaricom M-Pesa, Orange Money, and others. Check our coverage map for the latest updates.'
  },
  {
    question: 'How quickly will I receive my funds?',
    answer: 'Funds are typically settled within 24 hours to your bank account. During peak times, settlements may take up to 48 hours. You can also enable instant settlements for a small fee if you need funds urgently. All settlements are automatic and secure.'
  },
  {
    question: 'What are your transaction fees?',
    answer: 'Our fees vary based on your payment method and volume. Mobile Money transactions start at 1.5%, while card payments are 2.9% + fixed amount. Enterprise customers get custom rates. We always recommend checking our pricing page for the most current rates as they may vary by region.'
  },
  {
    question: 'Is ZOPAY secure and compliant?',
    answer: 'Yes, absolutely. We&apos;re PCI-DSS Level 1 compliant, use end-to-end encryption for all transactions, and implement advanced fraud detection. All data is encrypted in transit and at rest. We undergo regular security audits and penetration testing.'
  },
  {
    question: 'Do you offer test/sandbox environment?',
    answer: 'Yes, every account gets access to our full sandbox environment. You can test all features without real transactions. Use our test cards and mobile money numbers to simulate different payment scenarios before going live.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer 24/7 email and chat support for all customers. Premium customers also get dedicated account managers and priority support. Our team speaks multiple African languages and understands the local market.'
  },
  {
    question: 'Can I integrate ZOPAY with my existing system?',
    answer: 'Absolutely. We provide flexible integration options including REST APIs, webhooks, pre-built plugins for popular platforms, and payment links. Whether you&apos;re running custom code or using WordPress, Shopify, or WooCommerce, we have integration options for you.'
  },
  {
    question: 'What happens if a transaction fails?',
    answer: 'We automatically retry failed transactions up to 3 times. You&apos;ll receive notifications for all failed attempts. Our support team is available to help troubleshoot issues. Most failures are resolved within 24 hours.'
  }
]

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors"
      >
        <CardTitle className="text-base text-foreground">{item.question}</CardTitle>
        <ChevronDown
          className={`h-5 w-5 text-primary flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <CardContent className="px-6 py-4 bg-muted/20 border-t border-border">
          <p className="text-foreground/70 leading-relaxed">{item.answer}</p>
        </CardContent>
      )}
    </Card>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-balance text-foreground/70">
            Got questions? We&apos;ve got answers. Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} item={faq} index={index} />
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 border-primary/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Still have questions?</CardTitle>
            <CardDescription>Our support team is here to help you 24/7</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <a href="mailto:support@zopay.com" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
              Email: support@zopay.com
            </a>
            <span className="hidden text-foreground/30 sm:inline">•</span>
            <a href="tel:+1234567890" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
              Chat with us live
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
