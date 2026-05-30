import { ArrowRight } from 'lucide-react'

const sdks = [
  {
    name: 'Node.js/JavaScript',
    description: 'Official SDK for Node.js and JavaScript environments',
    package: 'npm install @zopay/sdk',
    docs: '/docs/sdk/nodejs',
    icon: '⚡'
  },
  {
    name: 'Python',
    description: 'Python SDK for server-side integration',
    package: 'pip install zopay',
    docs: '/docs/sdk/python',
    icon: '🐍'
  },
  {
    name: 'PHP',
    description: 'PHP SDK for Laravel, WordPress, and other frameworks',
    package: 'composer require zopay/sdk',
    docs: '/docs/sdk/php',
    icon: '🐘'
  },
  {
    name: 'Java',
    description: 'Java SDK for enterprise applications',
    package: 'gradle: com.zopay:sdk:latest',
    docs: '/docs/sdk/java',
    icon: '☕'
  },
  {
    name: 'Go',
    description: 'Go SDK for high-performance applications',
    package: 'go get github.com/zopay/go-sdk',
    docs: '/docs/sdk/go',
    icon: '🔵'
  },
  {
    name: 'Ruby',
    description: 'Ruby SDK for Rails and Ruby applications',
    package: 'gem install zopay',
    docs: '/docs/sdk/ruby',
    icon: '💎'
  }
]

export default function SDKsAndLibraries() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            SDKs & Libraries
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Official SDKs for popular programming languages
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sdks.map((sdk) => (
            <div
              key={sdk.name}
              className="group rounded-lg border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-4">{sdk.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{sdk.name}</h3>
              <p className="text-sm text-foreground/70 mb-4">{sdk.description}</p>
              <div className="rounded bg-muted/50 p-3 mb-4 overflow-x-auto">
                <code className="text-xs text-foreground/80 font-mono break-words">{sdk.package}</code>
              </div>
              <a
                href={sdk.docs}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View Docs
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-border bg-gradient-to-r from-primary/5 to-accent/5 p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">API Reference</h3>
          <p className="text-foreground/70 mb-6 max-w-2xl">
            Comprehensive API documentation with examples for all endpoints, including authentication, transactions, webhooks, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90">
              View Full API Docs
            </button>
            <button className="rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-all hover:bg-primary/10">
              Download OpenAPI Spec
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
