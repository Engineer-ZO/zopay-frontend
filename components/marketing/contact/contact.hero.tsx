export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2 mb-6">
            <span className="text-sm font-semibold text-accent">Get in Touch</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            We&apos;re Here to Help
          </h1>
          <p className="mt-6 text-xl text-foreground/70 text-balance">
            Have questions about our payment solutions? Our team is ready to assist you with technical support or business inquiries.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <div className="rounded-lg bg-card border border-border p-4 text-sm">
              <p className="font-semibold text-foreground mb-1">Average Response Time</p>
              <p className="text-foreground/70">We typically respond within 2 hours</p>
            </div>
            <div className="rounded-lg bg-card border border-border p-4 text-sm">
              <p className="font-semibold text-foreground mb-1">Support Available</p>
              <p className="text-foreground/70">Monday - Friday, 9 AM - 6 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
