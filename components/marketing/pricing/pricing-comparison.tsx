import { Check, X } from 'lucide-react'

const features = [
  {
    category: 'Payment Methods',
    items: [
      { name: 'Mobile Money', starter: true, professional: true, enterprise: true },
      { name: 'Cards', starter: true, professional: true, enterprise: true },
      { name: 'Bank Transfer', starter: false, professional: true, enterprise: true },
      { name: 'International Payments', starter: false, professional: true, enterprise: true },
    ],
  },
  {
    category: 'Features',
    items: [
      { name: 'Payment Links', starter: true, professional: true, enterprise: true },
      { name: 'API Access', starter: true, professional: true, enterprise: true },
      { name: 'Event Ticketing', starter: false, professional: true, enterprise: true },
      { name: 'Online Store', starter: false, professional: true, enterprise: true },
      { name: 'Custom Branding', starter: false, professional: true, enterprise: true },
      { name: 'Webhook Integrations', starter: false, professional: true, enterprise: true },
    ],
  },
  {
    category: 'Support',
    items: [
      { name: 'Email Support', starter: true, professional: true, enterprise: true },
      { name: 'Priority Support', starter: false, professional: true, enterprise: true },
      { name: 'Dedicated Account Manager', starter: false, professional: false, enterprise: true },
      { name: '24/7 Phone Support', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: 'Security & Compliance',
    items: [
      { name: 'PCI DSS Compliance', starter: true, professional: true, enterprise: true },
      { name: 'Two-Factor Authentication', starter: true, professional: true, enterprise: true },
      { name: 'Advanced Security Features', starter: false, professional: true, enterprise: true },
      { name: 'SLA Guarantee', starter: false, professional: false, enterprise: true },
    ],
  },
]

export default function PricingComparison() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Feature Comparison
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Everything you need to know about each plan
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Features</th>
                <th className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-foreground">Starter</span>
                    <span className="text-xs font-normal text-foreground/60">Free</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-center bg-accent/5 border-x border-border">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground mb-2">
                      Most Popular
                    </span>
                    <span className="text-sm font-bold text-foreground">Professional</span>
                    <span className="text-xs font-normal text-foreground/60">XAF 4,999/mo</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-foreground">Enterprise</span>
                    <span className="text-xs font-normal text-foreground/60">Custom</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {features.map((section, sectionIdx) => (
                <>
                  <tr className="bg-muted/40 hover:bg-muted/60 transition-colors">
                    <td colSpan={4} className="px-6 py-5">
                      <p className="font-bold text-sm uppercase tracking-wider text-foreground/80">{section.category}</p>
                    </td>
                  </tr>
                  {section.items.map((item, itemIdx) => (
                    <tr key={item.name} className={`transition-colors ${
                      itemIdx % 2 === 0 ? 'bg-background hover:bg-muted/20' : 'bg-muted/5 hover:bg-muted/30'
                    }`}>
                      <td className="px-6 py-4 text-sm font-medium text-foreground/85">{item.name}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {item.starter ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
                              <Check className="h-4 w-4 text-accent font-bold" />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-foreground/15" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-x border-border bg-accent/3">
                        <div className="flex justify-center">
                          {item.professional ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15">
                              <Check className="h-4 w-4 text-accent font-bold" />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-foreground/15" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {item.enterprise ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
                              <Check className="h-4 w-4 text-accent font-bold" />
                            </div>
                          ) : (
                            <X className="h-5 w-5 text-foreground/15" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-foreground mb-2">Starter</h3>
            <p className="text-sm text-foreground/70">Get started free with essential payment tools. Perfect for individuals and small projects.</p>
          </div>
          <div className="rounded-lg border-2 border-accent p-6 bg-gradient-to-b from-accent/5 to-transparent hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-foreground mb-2">Professional</h3>
            <p className="text-sm text-foreground/70">The most popular choice. Scale your business with advanced features and priority support.</p>
          </div>
          <div className="rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-foreground mb-2">Enterprise</h3>
            <p className="text-sm text-foreground/70">Custom solutions for large-scale operations with dedicated support and SLA guarantee.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
