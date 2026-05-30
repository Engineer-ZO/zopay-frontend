import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const tiers = [
  {
    name: 'Starter',
    description: 'Perfect for getting started',
    price: 'Free',
    features: [
      'Up to 10 transactions/month',
      'Basic payment links',
      'Mobile Money support',
      'Email support',
      'Dashboard analytics',
      'API access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses',
    price: '4,999',
    currency: 'XAF',
    period: '/month',
    features: [
      'Unlimited transactions',
      'Payment links & APIs',
      'Event ticketing',
      'Online store',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'Webhook integrations',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large-scale operations',
    price: 'Custom',
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Custom integration support',
      'SLA guarantee',
      'Advanced security features',
      'White-label solution',
      'API rate limit increase',
      '24/7 phone support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function PricingCards() {
  return (
    <section className="relative bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'border-2 border-accent bg-gradient-to-b from-accent/5 to-transparent ring-2 ring-accent/20'
                  : 'border border-border bg-card'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                <p className="mt-2 text-sm text-foreground/60">{tier.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  {tier.currency && <span className="text-sm font-semibold text-foreground/70">{tier.currency}</span>}
                  <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                </div>
                {tier.period && <span className="text-foreground/60">{tier.period}</span>}
              </div>

              <Button
                className={`w-full mb-8 ${
                  tier.highlighted
                    ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {tier.cta}
              </Button>

              <div className="space-y-4">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
