"use client";

import { Hero } from "@/components/marketing/sections/Hero";
import { Features } from "@/components/marketing/sections/Features";
import { Developers } from "@/components/marketing/sections/Developers";
import { CTA } from "@/components/marketing/sections/CTA";

export default function MarketingHome() {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero />
            <Features />
            <Developers />
            <CTA />
        </div>
    );
}
