import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, DollarSign, BarChart3, Shield } from 'lucide-react'

const technologies = [
  {
    title: 'Mobile Money Integration',
    description: 'Direct integration with all major mobile money providers across Africa',
    icon: Smartphone,
    providers: ['MTN Money', 'Airtel Money', 'Vodafone Cash', 'Safaricom M-Pesa', 'Orange Money', 'And more...']
  },
  {
    title: 'Multiple Payment Methods',
    description: 'Accept payments from any source your customers prefer',
    icon: DollarSign,
    providers: ['Visa', 'Mastercard', 'Bank Transfers', 'USSD', 'Wallets', 'Crypto']
  },
  {
    title: 'Real-Time Analytics',
    description: 'Comprehensive dashboards for tracking transactions and revenue',
    icon: BarChart3,
    providers: ['Transaction Reports', 'Revenue Analytics', 'Customer Insights', 'Custom Reports', 'API Access', 'Webhooks']
  },
  {
    title: 'Advanced Security',
    description: 'Bank-level security for all transactions and data',
    icon: Shield,
    providers: ['PCI-DSS Compliant', 'End-to-End Encryption', 'Fraud Detection', '3D Secure', 'Tokenization', 'Webhooks']
  },
]

export default function TechStack() {
  return (
    <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Powerful Infrastructure
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-foreground/70">
            Built on cutting-edge technology to support the unique needs of African markets
          </p>
        </div>

        {/* Technologies Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {technologies.map((tech) => {
            const Icon = tech.icon
            return (
              <Card key={tech.title} className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3 text-foreground">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {tech.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{tech.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tech.providers.map((provider) => (
                      <Badge key={provider} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
