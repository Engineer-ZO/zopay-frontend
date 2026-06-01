"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import { useState, useEffect, startTransition } from "react";
import Image from "next/image";
import { useTranslation } from "@/core/i18n/useTranslation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "@/features/auth/context/AuthContext";
export default function Header() {
  const { t } = useTranslation("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        
        <Link href="/" className="flex items-center gap-2">
          <Image
                            src="/zopaylogo.png"
                            alt="ZoPay Logo"
                            width={140}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
        </Link>

        <div className="hidden gap-8 md:flex">
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="/developers"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Developers
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Contact
          </Link>
          {/* <Link href="/about" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            About
          </Link> */}
        </div>

        {/* Right Side - Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          {isAuthenticated && user ? (
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#ef2d10" }}
              title={user.email}
            >
              {getInitials(user.email)}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile - Toggles and Hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
        </div> */}
      </nav>
    </header>
  );
}
