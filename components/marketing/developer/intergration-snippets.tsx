'use client'

import { useState } from 'react'
import CodeBlock from './code-block'
import { ChevronDown } from 'lucide-react'

const integrationMethods = [
  {
    id: 'popup-js',
    name: 'Popup JS',
    description: 'Initialize a payment popup with JavaScript',
    code: `<script src="https://zopay.com/js/zopay.min.js"></script>
<script>
  const zopay = new ZoPay({
    publicKey: 'YOUR_PUBLIC_KEY',
    onSuccess: (response) => {
      console.log('Payment successful:', response);
    },
    onError: (error) => {
      console.error('Payment failed:', error);
    }
  });
  
  zopay.openPaymentModal({
    amount: 10000,
    currency: 'XAF',
    email: 'customer@example.com',
    reference: 'TXN-' + Date.now()
  });
</script>`,
    language: 'javascript'
  },
  {
    id: 'popup-button',
    name: 'Popup Button',
    description: 'Simple button that triggers payment popup',
    code: `<button 
  class="zopay-button" 
  data-public-key="YOUR_PUBLIC_KEY"
  data-amount="10000"
  data-currency="XAF"
  data-email="customer@example.com"
  data-reference="TXN-123456">
  Pay with ZOPAY
</button>

<script src="https://zopay.com/js/zopay.min.js"></script>
<script>
  ZoPay.initButtons();
</script>`,
    language: 'html'
  },
  {
    id: 'inline',
    name: 'Inline Embed',
    description: 'Embed payment form directly on your page',
    code: `<div id="zopay-inline-form"></div>

<script src="https://zopay.com/js/zopay.min.js"></script>
<script>
  ZoPay.renderInline({
    container: '#zopay-inline-form',
    publicKey: 'YOUR_PUBLIC_KEY',
    amount: 10000,
    currency: 'XAF',
    email: 'customer@example.com',
    onSuccess: (response) => {
      console.log('Payment successful:', response);
    }
  });
</script>`,
    language: 'javascript'
  },
  {
    id: 'url',
    name: 'URL',
    description: 'Redirect to payment page via URL',
    code: `https://pay.zopay.com/pay?
public_key=YOUR_PUBLIC_KEY&
amount=10000&
currency=XAF&
email=customer@example.com&
reference=TXN-123456&
redirect_url=https://yoursite.com/success`,
    language: 'plaintext'
  },
  {
    id: 'encoded-url',
    name: 'Encoded URL',
    description: 'URL-encoded payment link',
    code: `https://pay.zopay.com/pay?public_key=YOUR_PUBLIC_KEY&amount=10000&currency=XAF&email=customer%40example.com&reference=TXN-123456&redirect_url=https%3A%2F%2Fyoursite.com%2Fsuccess`,
    language: 'plaintext'
  },
  {
    id: 'qrcode',
    name: 'QR Code',
    description: 'Generate QR code for mobile payment',
    code: `<img 
  src="https://zopay.com/qr?
public_key=YOUR_PUBLIC_KEY&
amount=10000&
currency=XAF&
reference=TXN-123456" 
  alt="Scan to pay with ZOPAY"
/>`,
    language: 'html'
  },
  {
    id: 'post-form',
    name: 'HTTP POST Form',
    description: 'Traditional form submission',
    code: `<form method="POST" action="https://pay.zopay.com/pay">
  <input type="hidden" name="public_key" value="YOUR_PUBLIC_KEY">
  <input type="hidden" name="amount" value="10000">
  <input type="hidden" name="currency" value="XAF">
  <input type="hidden" name="email" value="customer@example.com">
  <input type="hidden" name="reference" value="TXN-123456">
  <input type="hidden" name="redirect_url" value="https://yoursite.com/success">
  
  <button type="submit" class="btn btn-primary">
    Pay with ZOPAY
  </button>
</form>`,
    language: 'html'
  },
  {
    id: 'get-link',
    name: 'HTTP GET Link',
    description: 'Simple link for payment',
    code: `<a href="https://pay.zopay.com/pay?public_key=YOUR_PUBLIC_KEY&amount=10000&currency=XAF&email=customer@example.com&reference=TXN-123456&redirect_url=https://yoursite.com/success">
  Pay with ZOPAY
</a>`,
    language: 'html'
  }
]

export default function IntegrationSnippets() {
  const [expandedId, setExpandedId] = useState('popup-js')

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Integration Methods
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Choose the integration method that best fits your platform
          </p>
        </div>

        <div className="space-y-4">
          {integrationMethods.map((method) => (
            <div key={method.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === method.id ? '' : method.id)}
                className="w-full flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors px-6 py-4"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-foreground">{method.name}</h3>
                  <p className="text-sm text-foreground/60">{method.description}</p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-foreground/60 transition-transform ${
                    expandedId === method.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === method.id && (
                <div className="border-t border-border bg-background p-6">
                  <CodeBlock
                    code={method.code}
                    language={method.language}
                    title={`${method.name} Example`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-accent/20 bg-accent/5 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Start Tips</h3>
          <ul className="space-y-3 text-foreground/70">
            <li className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <span>Replace YOUR_PUBLIC_KEY with your actual public key from the dashboard</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <span>All amounts should be in XAF (Central African Franc)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <span>reference should be unique for each transaction</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-bold">→</span>
              <span>redirect_url is where customers return after payment</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
