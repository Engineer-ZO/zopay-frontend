import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Check } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Create Account',
    description: 'Sign up for free and verify your business details. Takes just 5 minutes.'
  },
  {
    number: '2',
    title: 'Setup Integration',
    description: 'Use our payment links, APIs, or pre-built plugins. Choose what works best for you.'
  },
  {
    number: '3',
    title: 'Start Collecting',
    description: 'Begin accepting payments immediately. Get settled funds within 24 hours.'
  },
  {
    number: '4',
    title: 'Scale & Grow',
    description: 'Access advanced features, analytics, and dedicated support as you scale.'
  },
]

const features = [
  'No setup fees',
  'Instant activation',
  'Competitive rates',
  '24/7 Support',
  'Advanced fraud detection',
  'Multi-currency support'
]

export default function GetStarted() {
  return (
    <section id="getstarted" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How to Get Started
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-foreground/70">
            Join thousands of successful businesses accepting payments on ZOPAY
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="border-border h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg text-foreground">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden absolute -right-3 top-1/2 h-8 w-6 -translate-y-1/2 items-center justify-center lg:flex">
                  <ArrowRight className="h-5 w-5 text-primary/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Features & CTA */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Left side - Features */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">What&apos;s Included</h3>
              <p className="text-foreground/70 mb-6">
                Everything you need to build a successful payment experience
              </p>
            </div>

            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side - CTA Card */}
          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="text-foreground">Ready to Accept Payments?</CardTitle>
              <CardDescription>
                Join the payment revolution in Africa. Get started in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-card/50 p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">Special Offer for New Merchants</p>
                <p className="text-sm text-foreground/70">
                  First 100 transactions are free. No credit card required to start.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                  Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  Schedule Demo
                </Button>
              </div>

              <p className="text-xs text-foreground/60 text-center">
                No credit card required • Takes less than 5 minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
