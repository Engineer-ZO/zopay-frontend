import Link from "next/link";
import Image from "next/image";
import Logo from "./logo";
import Header from "./header";

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        {/* <Header /> */}
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center px-4 py-8 ">

            {/* Logo - Fixed positioning with proper spacing */}
            <div className="mb-8">
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
            </div>

            {/* Content */}
            {children}
        </div>
        </>
    );
}
