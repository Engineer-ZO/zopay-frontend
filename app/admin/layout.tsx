"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { motion } from "framer-motion";
import Image from "next/image";
import { getAuthData } from "@/features/auth/utils/storage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define public admin pages that don't need the shell
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname === "/admin"; // Redirect root admin to login usually

  useEffect(() => {
    // Skip auth check for login pages
    if (isAuthPage) {
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return;
    }

    // Check admin authentication
    const authData = getAuthData();

    // Must be authenticated AND have admin role
    if (!authData || !authData.accessToken || !authData.user || authData.user.role !== 'admin') {
      router.push("/admin/login");
        } else if (authData.user.mustChangePassword) {
            // First-login password change requirement
            router.push("/change-password");
    } else {
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 0);
    }
  }, [router, isAuthPage]);

  // If it's an auth page, just render it full screen
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-blue-900 to-purple-900">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Logo */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/zitopaylogo.png"
              alt="ZitoPay"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Loading Spinner */}
          <motion.div
            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.p
            className="text-sm font-medium text-blue-200"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading admin portal...
          </motion.p>
        </div>
      </div>
    );
  }

  // Don't render dashboard shell if not authenticated (should have redirected)
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  // Render Admin Shell
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
        {/* Top Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
