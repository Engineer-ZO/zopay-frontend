import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import Header from '@/components/header'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ZITOPAY - Payment Platform for Africa',
  description: 'Accept Mobile Money and cards instantly. Power your collections and disbursements with secure, developer-friendly tools built for the African market.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <Header />
        {children}
        {process.env.NODE_ENV === 'production'}
      </body>
    </html>
  )
}




// import { ReactNode } from "react";
// import { Nav } from "@/components/Nav";
// import { Footer } from "@/components/Footerws";

// export default function MarketingLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   return (
//     <div className="flex flex-col min-h-screen bg-background text-foreground">
//       <Nav />
//       <main className="flex-1">
//         {children}
//       </main>
//       <Footer />
//     </div>
//   );
// }
