import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Mail, Linkedin, Twitter } from 'lucide-react'

import Image from "next/image";
const footerLinks = {
  Products: [
    { label: 'Payment Links', href: '#' },
    { label: 'Event Ticketing', href: '#' },
    { label: 'Online Store', href: '#' },
    { label: 'Payment APIs', href: '#' },
    { label: 'Pricing', href: '#' },
  ],
  Developers: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Code Examples', href: '#' },
    { label: 'GitHub', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Compliance', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Top Section */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="#" className="flex items-center gap-2">
               <Image
                            src="/zopaylogo.png"
                            alt="ZoPay Logo"
                            width={140}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
              </Link>
              <p className="mt-4 text-sm text-foreground/60">
                Secure payment solutions for African businesses.
              </p>
              <div className="flex gap-4 mt-6">
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold text-foreground mb-4">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Separator */}
          <Separator className="my-8" />

          {/* Bottom Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-foreground/60">
              © 2024 ZOPAY. All rights reserved. Trusted by businesses across Africa.
            </p>
            <div className="flex gap-6 text-sm text-foreground/60">
              <Link href="#" className="hover:text-foreground transition-colors">
                Compliance
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Security
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Status
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-xs text-foreground/60 mb-4">Trusted by leading organizations</p>
            <div className="flex flex-wrap gap-6 items-center opacity-60">
              <div className="text-sm font-medium text-foreground/60">PCI-DSS Level 1</div>
              <div className="text-sm font-medium text-foreground/60">ISO 27001 Certified</div>
              <div className="text-sm font-medium text-foreground/60">SOC 2 Compliant</div>
              <div className="text-sm font-medium text-foreground/60">GDPR Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
