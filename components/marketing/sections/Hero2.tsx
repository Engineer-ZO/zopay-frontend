import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Lock } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Announcement Banner */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Now accepting payments in 15+ African countries</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="mb-12 space-y-6 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Power Your Business with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Seamless Payments</span>
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg text-foreground/70">
            Accept Mobile Money and cards instantly. Power your collections and disbursements with secure, developer-friendly tools built for the African market.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start for Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            View Documentation
          </Button>
        </div>

        {/* Trust Section */}
        <div className="space-y-4 rounded-xl border border-border bg-card/50 p-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <p className="text-sm font-semibold text-foreground">Enterprise-Grade Security</p>
          </div>
          <p className="text-sm text-foreground/70">
            PCI-DSS compliant, encrypted transactions, and fraud detection. Trusted by leading businesses across Africa.
          </p>
          <div className="flex flex-wrap gap-6 pt-4">
            <div>
              <p className="text-sm font-semibold text-foreground">10M+</p>
              <p className="text-xs text-foreground/60">Transactions Processed</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">50K+</p>
              <p className="text-xs text-foreground/60">Active Merchants</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">99.9%</p>
              <p className="text-xs text-foreground/60">Uptime SLA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
