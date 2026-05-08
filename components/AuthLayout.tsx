import Link from "next/link";
import Image from "next/image";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center px-4 py-8">
            {/* Logo - Fixed positioning with proper spacing */}
            <div className="mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/zitopaylogo.png"
                        alt="ZitoPay Logo"
                        width={150}
                        height={50}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
