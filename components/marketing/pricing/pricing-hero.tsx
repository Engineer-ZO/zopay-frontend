export default function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Simple, Transparent <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-foreground/70">
            Choose the perfect plan for your business. All plans include core features to get you started with ZOPAY.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <span className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground">
              Monthly billing
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
