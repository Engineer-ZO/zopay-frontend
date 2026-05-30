import Header from '@/components/header'
import Footer from '@/components/footer'
import ContactHero from '@/components/marketing/contact/contact.hero'
import ContactForm from '@/components/marketing/contact/contact.form'
import ContactMethods from '@/components/marketing/contact/contact.method'
import ContactInfo from '@/components/marketing/contact/contact.info'
import ContactFAQ from '@/components/marketing/contact/contact-faq'

export const metadata = {
  title: 'Contact Us - ZITOPAY',
  description: 'Get in touch with our team. We\'re here to help with technical and commercial inquiries.',
}

export default function ContactPage() {
  return (
    <main className="w-full">
      <ContactHero />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <ContactForm />
          <div className="space-y-12">
            <ContactMethods />
            <ContactInfo />
          </div>
        </div>
      </div>
      <ContactFAQ />
      <Footer />
    </main>
  )
}
