import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Code2, BookOpen, Github, Zap } from 'lucide-react'

export default function DeveloperSection() {
  return (
    <section id="developer" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Developers
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-foreground/70">
            Simple, powerful APIs and SDKs that make payment integration quick and painless
          </p>
        </div>

        {/* Developer Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader>
              <Code2 className="mb-3 h-6 w-6 text-primary" />
              <CardTitle className="text-foreground">Easy Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                RESTful APIs and pre-built SDKs for JavaScript, Python, Go, and more
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <BookOpen className="mb-3 h-6 w-6 text-primary" />
              <CardTitle className="text-foreground">Complete Docs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed documentation with code examples and interactive API explorer
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <Zap className="mb-3 h-6 w-6 text-primary" />
              <CardTitle className="text-foreground">Fast Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get a sandbox account in minutes and start testing immediately
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <Github className="mb-3 h-6 w-6 text-primary" />
              <CardTitle className="text-foreground">Open Source</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We&apos;re open source. Contribute, report issues, and help us improve
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Code Example */}
        <Card className="mt-12 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Integration Example</CardTitle>
            <CardDescription>Get started in just a few lines of code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-foreground/5 p-6">
              <pre className="overflow-x-auto text-sm text-foreground/80">
                <code>{`// Initialize ZOPAY client
import { ZoPay } from '@zopay/sdk';

const zo = new ZoPay({
  apiKey: process.env.ZOPAY_API_KEY,
});

// Create a payment link
const link = await zo.paymentLinks.create({
  amount: 50000, // GHS
  currency: 'GHS',
  reference: 'order_123',
  description: 'Premium Subscription',
  callbackUrl: 'https://yourapp.com/callback',
});

console.log(link.shortUrl);`}</code>
              </pre>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="bg-primary hover:bg-primary/90">
                Read API Docs
              </Button>
              <Button variant="outline">
                View GitHub Examples
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SDKs Grid */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Available SDKs</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {['JavaScript', 'Python', 'Go', 'Java', 'PHP', 'Ruby'].map((sdk) => (
              <Card key={sdk} className="border-border text-center">
                <CardContent className="flex items-center justify-center py-4">
                  <Badge variant="secondary">{sdk}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
