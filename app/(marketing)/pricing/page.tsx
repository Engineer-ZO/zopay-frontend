"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap, Building, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const pricingTiers = [
  {
    name: "Starter",
    price: "29",
    description: "Perfect for testing and early-stage startups",
    features: [
      "10,000 monthly transactions",
      "2 Payment Gateways",
      "Standard Support (Email)",
      "Basic Analytics",
      "Sandbox Environment",
      "Standard API access"
    ],
    cta: "Start Free Trial",
    popular: false,
    color: "bg-background border-border",
    buttonStyle: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    priceColor: "text-foreground"
  },
  {
    name: "Professional",
    price: "99",
    description: "For growing businesses scaling their payments",
    features: [
      "100,000 monthly transactions",
      "5 Payment Gateways",
      "Priority Support (24/7)",
      "Advanced Analytics & Reporting",
      "Sandbox & Staging Environments",
      "Webhooks & Event Streams",
      "Team Management (5 seats)"
    ],
    cta: "Get Started",
    popular: true,
    color: "bg-[#0A0A0B] border-[#0A0A0B] text-white",
    buttonStyle: "bg-gradient-to-r from-[#ef2d10] to-[#d0260e] text-white hover:shadow-lg hover:from-[#d0260e] hover:to-[#ef2d10]",
    priceColor: "text-white"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom solutions for high-volume organizations",
    features: [
      "Unlimited transactions",
      "All Payment Gateways",
      "Dedicated Account Manager",
      "Custom Reporting & SQL Access",
      "SLA & Uptime Guarantees",
      "On-premise deployment options",
      "Unlimited Team Seats",
      "White-label options"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "bg-background border-border",
    buttonStyle: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    priceColor: "text-foreground"
  }
];

const feeStructure = [
  {
    category: "Mobile Money",
    fees: "1.5% + 50 XAF",
    description: "MTN, Orange Money"
  },
  {
    category: "Cards",
    fees: "2.9% + 100 XAF",
    description: "Visa, Mastercard"
  },
  {
    category: "Bank Transfer",
    fees: "1.0% + 200 XAF",
    description: "Direct bank integration"
  },
  {
    category: "International",
    fees: "3.5% + 200 XAF",
    description: "Cross-border payments"
  }
];

export default function PricingPage() {
  const [volume, setVolume] = useState(5000000);
  const [currency, setCurrency] = useState("XAF");

  // Simple calculator logic
  const calculateSavings = (vol: number) => {
    // Assume simplified competitor rate of 3.5% vs our average effective rate of 2%
    const competitorCost = vol * 0.035;
    const ourCost = vol * 0.02;
    return (competitorCost - ourCost).toLocaleString();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Transparent,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                Fair Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              No hidden fees. Pay only for what you use and grow with us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 border hover:scale-105 transition-all duration-300 ${tier.color} ${tier.popular ? 'shadow-2xl ring-2 ring-[#ef2d10]/20' : 'shadow-lg'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ef2d10] to-[#d0260e] text-white text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={`text-xl font-bold ${tier.name === 'Professional' ? 'text-white' : 'text-foreground'}`}>{tier.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      {tier.price !== "Custom" && <span className={`text-md align-top mr-1 font-medium text-muted-foreground`}>$</span>}
                      <span className={`text-5xl font-bold tracking-tight ${tier.priceColor}`}>{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-muted-foreground ml-2">/month</span>}
                    </div>
                    <p className="mt-4 text-muted-foreground">{tier.description}</p>
                  </div>

                  <Link
                    href={tier.price === "Custom" ? "/contact" : "/get-started"}
                    className={`block w-full py-4 rounded-xl text-center font-bold transition-all ${tier.buttonStyle}`}
                  >
                    {tier.cta}
                  </Link>

                  <div className="space-y-4 pt-6 border-t border-border/10">
                    <p className={`font-semibold ${tier.name === 'Professional' ? 'text-white' : 'text-foreground'}`}>Includes:</p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 shrink-0 ${tier.popular ? 'text-[#ef2d10]' : 'text-green-500'}`} />
                          <span className={`text-sm ${tier.name === 'Professional' ? 'text-gray-300' : 'text-muted-foreground'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fees Structure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12">Transaction Fees</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {feeStructure.map((fee, index) => (
                <div key={index} className="bg-muted/30 rounded-2xl p-6 text-center border border-border">
                  <h3 className="font-semibold mb-2">{fee.category}</h3>
                  <div className="text-2xl font-bold text-[#2466eb] mb-2">{fee.fees}</div>
                  <p className="text-sm text-muted-foreground">{fee.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Calculate Your Savings</h2>
              <p className="text-lg text-muted-foreground">See how much you could save by switching to ZitoPay</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background rounded-3xl p-8 md:p-12 shadow-xl border border-border"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2">Monthly Volume (XAF)</label>
                    <div className="text-3xl font-bold text-[#2466eb] mb-4">
                      {volume.toLocaleString()} {currency}
                    </div>
                    <input
                      type="range"
                      min="100000"
                      max="50000000"
                      step="100000"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-[#ef2d10]"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>100k</span>
                      <span>50M+</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-2">Why ZitoPay?</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Transparent flat-rate pricing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> No hidden maintenance fees
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Volume discounts available
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center md:text-left space-y-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Potential Monthly Savings</p>
                    <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                      {calculateSavings(volume)} {currency}
                    </div>
                    <p className="text-sm text-muted-foreground">*Estimated based on average market rates</p>
                  </div>
                  <Link
                    href="/get-started"
                    className="inline-block w-full md:w-auto px-8 py-4 bg-[#2466eb] text-white rounded-xl font-bold hover:bg-[#1d55c7] transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Saving Today
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
