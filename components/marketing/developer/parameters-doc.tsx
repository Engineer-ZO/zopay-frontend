import { CheckCircle } from 'lucide-react'

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

const parameters: Parameter[] = [
  {
    name: 'public_key',
    type: 'string',
    required: true,
    description: 'Your public API key from the dashboard',
    example: 'pk_live_a1b2c3d4e5f6g7h8'
  },
  {
    name: 'amount',
    type: 'integer',
    required: true,
    description: 'Transaction amount in XAF (minimum 100 XAF)',
    example: '10000'
  },
  {
    name: 'currency',
    type: 'string',
    required: true,
    description: 'Currency code (currently XAF)',
    example: 'XAF'
  },
  {
    name: 'email',
    type: 'string',
    required: true,
    description: 'Customer email address',
    example: 'customer@example.com'
  },
  {
    name: 'reference',
    type: 'string',
    required: true,
    description: 'Unique transaction reference (alphanumeric, max 50 chars)',
    example: 'TXN-20240526-001'
  },
  {
    name: 'first_name',
    type: 'string',
    required: false,
    description: 'Customer first name',
    example: 'John'
  },
  {
    name: 'last_name',
    type: 'string',
    required: false,
    description: 'Customer last name',
    example: 'Doe'
  },
  {
    name: 'phone',
    type: 'string',
    required: false,
    description: 'Customer phone number',
    example: '+237671234567'
  },
  {
    name: 'description',
    type: 'string',
    required: false,
    description: 'Transaction description/purpose',
    example: 'Online store purchase'
  },
  {
    name: 'metadata',
    type: 'object',
    required: false,
    description: 'Custom data as JSON object (max 1KB)',
    example: '{"order_id":"12345","user_id":"67890"}'
  },
  {
    name: 'redirect_url',
    type: 'string',
    required: false,
    description: 'URL to redirect after successful payment',
    example: 'https://yoursite.com/success'
  },
  {
    name: 'payment_method',
    type: 'string',
    required: false,
    description: 'Preferred payment method (mobile_money, card, bank_transfer, international)',
    example: 'mobile_money'
  },
  {
    name: 'api_version',
    type: 'string',
    required: false,
    description: 'API version to use',
    example: 'v1'
  }
]

export default function ParametersDoc() {
  return (
    <section className="bg-muted/20 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Request Parameters
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            The following parameters can be sent through HTTP GET or POST request to the payment URL
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Parameter</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Type</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-foreground">Required</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Description</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {parameters.map((param, index) => (
                <tr
                  key={param.name}
                  className={`transition-colors ${
                    index % 2 === 0 ? 'bg-background hover:bg-muted/20' : 'bg-muted/5 hover:bg-muted/30'
                  }`}
                >
                  <td className="px-6 py-4">
                    <code className="rounded bg-muted/50 px-2 py-1 text-sm font-mono text-foreground">
                      {param.name}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground/70">{param.type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {param.required ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-accent" />
                      </div>
                    ) : (
                      <span className="text-xs text-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground/80">{param.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-foreground/60 break-words">{param.example}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">HTTP GET Request</h3>
            <p className="text-sm text-foreground/70 mb-4">
              All parameters are appended to the URL as query strings:
            </p>
            <div className="rounded bg-muted/30 p-3 overflow-x-auto">
              <code className="text-xs text-foreground/80 font-mono break-words">
                {'GET https://pay.zopay.com/pay?public_key=YOUR_KEY&amount=10000&...'}
              </code>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">HTTP POST Request</h3>
            <p className="text-sm text-foreground/70 mb-4">
              Send parameters in the request body as form data:
            </p>
            <div className="rounded bg-muted/30 p-3 overflow-x-auto">
              <code className="text-xs text-foreground/80 font-mono break-words">
                {'POST https://pay.zopay.com/pay\nContent-Type: application/x-www-form-urlencoded'}
              </code>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Important Notes</h3>
          <ul className="space-y-3 text-foreground/70">
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">⚠</span>
              <span>Always use HTTPS for production. HTTP is only for development/testing.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">⚠</span>
              <span>Special characters in parameters should be URL-encoded</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">⚠</span>
              <span>Reference must be unique for each transaction. Duplicate references will be rejected.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600 font-bold">⚠</span>
              <span>Never expose your secret API key in client-side code</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
