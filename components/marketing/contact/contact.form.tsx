'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    questionType: 'commercial',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    return newErrors
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitted(true)
    setIsLoading(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        questionType: 'commercial',
        message: '',
      })
      setSubmitted(false)
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-foreground">Thank You!</h3>
        <p className="text-center text-foreground/70 mb-4">
          We&apos;ve received your message and will get back to you within 2 hours.
        </p>
        <p className="text-sm text-foreground/60">Redirecting to home page...</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Send us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
            Subject <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="How can we help?"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {errors.subject && <p className="mt-2 text-sm text-red-500">{errors.subject}</p>}
        </div>

        {/* Question Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Question Type <span className="text-accent">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="questionType"
                value="technical"
                checked={formData.questionType === 'technical'}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <span className={`text-sm font-medium transition-colors ${
                formData.questionType === 'technical'
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              }`}>
                Technical
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="questionType"
                value="commercial"
                checked={formData.questionType === 'commercial'}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <span className={`text-sm font-medium transition-colors ${
                formData.questionType === 'commercial'
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground'
              }`}>
                Commercial
              </span>
            </label>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            Message <span className="text-accent">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us more about your inquiry..."
            rows={6}
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
              errors.message ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {errors.message && <p className="mt-2 text-sm text-red-500">{errors.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>

        <p className="text-xs text-foreground/60 text-center">
          We respect your privacy. Your information will only be used to respond to your inquiry.
        </p>
      </form>
    </div>
  )
}
