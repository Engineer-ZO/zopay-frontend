export default function DeveloperHero() {
  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 mb-6">
            <span className="text-xs font-semibold text-accent">DEVELOPER DOCUMENTATION</span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Build Powerful Payment Solutions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70">
            Copy the generated snippets for buttons, URLs or HTML forms to share or integrate on your web/mobile apps and start accepting universal payments, worldwide.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row items-center justify-center">
            <button className="rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg hover:shadow-xl">
              View API Docs
            </button>
            <button className="rounded-lg border border-border px-8 py-3 font-semibold text-foreground transition-all hover:bg-muted/50">
              Download SDK
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
