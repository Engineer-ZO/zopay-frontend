import { Mail, Phone, MessageSquare, Zap } from 'lucide-react'

const methods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 2 hours',
    contact: 'support@zopay.com',
    subtext: 'For general inquiries',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call us directly for urgent matters',
    contact: '+237 6XX XXX XXX',
    subtext: 'Mon-Fri, 9 AM - 6 PM',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our team in real-time',
    contact: 'Available on website',
    subtext: 'Mon-Fri, 10 AM - 5 PM',
  },
  {
    icon: Zap,
    title: 'Documentation',
    description: 'Find answers in our comprehensive docs',
    contact: 'docs.zopay.com',
    subtext: 'Available 24/7',
  },
]

export default function ContactMethods() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">Other Ways to Reach Us</h3>
      <div className="grid gap-4 sm:grid-cols-1">
        {methods.map((method) => {
          const Icon = method.icon
          return (
            <div
              key={method.title}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-accent/50 transition-all"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{method.title}</h4>
                  <p className="mt-1 text-sm text-foreground/70">{method.description}</p>
                  <p className="mt-3 font-semibold text-primary text-sm">{method.contact}</p>
                  <p className="text-xs text-foreground/50 mt-1">{method.subtext}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
