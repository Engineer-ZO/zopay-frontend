import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link as LinkIcon, Ticket, Store, Code2, QrCode, PieChart } from 'lucide-react'

const tools = [
  {
    title: 'Payment Links',
    description: 'Create shareable payment links instantly. No coding required. Share via SMS, email, or social media.',
    icon: LinkIcon,
    features: ['Instant generation', 'Custom branding', 'Multiple currencies', 'Real-time tracking']
  },
  {
    title: 'Event Ticketing',
    description: 'Sell event tickets with built-in seat management and automated delivery. Perfect for conferences and shows.',
    icon: Ticket,
    features: ['Seat management', 'Digital delivery', 'Barcode scanning', 'Analytics dashboard']
  },
  {
    title: 'Online Store',
    description: 'Launch a fully-featured online store in minutes. Manage inventory, orders, and customers seamlessly.',
    icon: Store,
    features: ['Product catalog', 'Inventory management', 'Order tracking', 'Customer analytics']
  },
  {
    title: 'Payment APIs',
    description: 'Integrate powerful payment functionality directly into your application. RESTful and easy to use.',
    icon: Code2,
    features: ['RESTful API', 'Mobile SDK', 'Webhooks', 'Sandbox environment']
  },
]

export default function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tools for Every Business
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-foreground/70">
            From simple payment links to complex payment flows, ZOPAY has everything you need to accept payments and manage your business.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card key={tool.title} className="group overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                        <span className="text-sm text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
