'use client'

import { useState } from 'react'

const paymentMethods = [
  { id: 'mobile', label: 'Mobile Money', percentage: 1.5, fixed: 50 },
  { id: 'card', label: 'Cards', percentage: 2.9, fixed: 100 },
  { id: 'bank', label: 'Bank Transfer', percentage: 1.0, fixed: 200 },
  { id: 'international', label: 'International', percentage: 3.5, fixed: 200 },
]

export default function PricingCalculator() {
  const [amount, setAmount] = useState(10000)
  const [selectedMethod, setSelectedMethod] = useState('card')

  const method = paymentMethods.find((m) => m.id === selectedMethod)
  const fee = method ? (amount * method.percentage) / 100 + method.fixed : 0
  const total = amount + fee

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setAmount(Math.max(0, value))
  }

  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Do the Math
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            See how much it costs to use ZOPAY. Enter an amount into the calculator to see our charges for transfer, topups, and payments.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="space-y-8">
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-foreground mb-4">
                Transaction Amount
              </label>
              <div className="relative">
                
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full rounded-lg border border-border bg-background px-12 py-4 text-lg font-semibold text-foreground placeholder-foreground/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Enter amount"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/60 font-semibold">XAF</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-4">
                Payment Method
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                      selectedMethod === method.id
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-border bg-background text-foreground/70 hover:border-border/50 hover:text-foreground'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-4 rounded-xl bg-muted/50 p-6">
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Amount</span>
                <span className="text-lg font-semibold text-foreground">{amount.toLocaleString()} xaf</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">
                  {method?.label} Fee ({method?.percentage}% + {method?.fixed} xaf)
                </span>
                <span className="text-lg font-semibold text-accent">+ {fee.toLocaleString('en-US', { maximumFractionDigits: 0 })} xaf</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Cost</span>
                <span className="text-2xl font-bold text-foreground">{total.toLocaleString('en-US', { maximumFractionDigits: 0 })} xaf</span>
              </div>
            </div>

            {/* Percentage Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-foreground/60 mb-1">Fee Percentage</p>
                <p className="text-2xl font-bold text-foreground">
                  {((fee / amount) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-foreground/60 mb-1">You Keep</p>
                <p className="text-2xl font-bold text-accent">
                  {(amount - fee).toLocaleString('en-US', { maximumFractionDigits: 0 })} xaf
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            Prices are in Cameroon Francs cfa (xaf). International rates may vary. Volume discounts available for large transactions.
          </p>
        </div>
      </div>
    </section>
  )
}
