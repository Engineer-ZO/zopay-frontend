import { CreditCard, Smartphone, Building2, Globe } from 'lucide-react'

const fees = [
  {
    icon: Smartphone,
    title: 'Mobile Money',
    description: 'MTN, Orange Money',
    percentage: '1.5%',
    fixed: '+ 50 XAF',
  },
  {
    icon: CreditCard,
    title: 'Cards',
    description: 'Visa, Mastercard',
    percentage: '2.9%',
    fixed: '+ 100 XAF',
  },
  {
    icon: Building2,
    title: 'Bank Transfer',
    description: 'Direct bank integration',
    percentage: '1.0%',
    fixed: '+ 200 XAF',
  },
  {
    icon: Globe,
    title: 'International',
    description: 'Cross-border payments',
    percentage: '3.5%',
    fixed: '+ 200 XAF',
  },
]

export default function TransactionFees() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Transaction Fees
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Transparent pricing for every payment method. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {fees.map((fee) => {
            const Icon = fee.icon
            return (
              <div key={fee.title} className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">{fee.title}</h3>
                <p className="mb-6 text-sm text-foreground/60">{fee.description}</p>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{fee.percentage}</span>
                    <span className="text-sm text-foreground/60">per transaction</span>
                  </div>
                  <p className="text-sm font-medium text-accent">{fee.fixed}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Example Calculation</h3>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Mobile Money (10,000xaf)</p>
              <p className="text-2xl font-bold text-foreground">200xaf</p>
              <p className="text-xs text-foreground/50 mt-1">(1.5% + 50)</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Card (10,000xaf)</p>
              <p className="text-2xl font-bold text-foreground">390xaf</p>
              <p className="text-xs text-foreground/50 mt-1">(2.9% + 100)</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Bank Transfer (10,000xaf)</p>
              <p className="text-2xl font-bold text-foreground">300xaf</p>
              <p className="text-xs text-foreground/50 mt-1">(1.0% + 200)</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">International (10,000xaf)</p>
              <p className="text-2xl font-bold text-foreground">550xaf</p>
              <p className="text-xs text-foreground/50 mt-1">(3.5% + 200)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
