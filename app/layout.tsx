import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { MerchantProvider } from "@/features/merchants/context/MerchantContext";
import { EnvironmentProvider } from "@/core/environment/EnvironmentContext";
import { LanguageProvider } from "@/core/i18n/LanguageProvider";
import { AuthCookieSync } from "@/components/AuthCookieSync";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "ZoPay - Mobile Money Payment Gateway",
  description: "Accept MTN Mobile Money and Orange Money payments with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "'Inter', Arial, Helvetica, sans-serif" }}
        suppressHydrationWarning
      >
        {/* Script for theme and language restoration - runs before hydration */}
        <Script
          id="theme-language-restore"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme restoration - must run before body renders
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Language restoration
                  const savedLang = localStorage.getItem('language');
                  const lang = (savedLang === 'fr' || savedLang === 'en') ? savedLang : 'en';
                  document.documentElement.lang = lang;
                } catch (error) {
                  // If localStorage fails, use defaults
                  console.error('Failed to restore theme/language:', error);
                  document.documentElement.lang = 'en';
                }
              })();
            `,
          }}
        />
        <Toaster position="top-right" richColors />
        <QueryProvider>
          <AuthProvider>
            <MerchantProvider>
              <EnvironmentProvider>
                <AuthCookieSync />
                <LanguageProvider>{children}</LanguageProvider>
              </EnvironmentProvider>
            </MerchantProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}