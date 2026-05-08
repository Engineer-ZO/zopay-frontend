"use client";

import { motion } from "framer-motion";
import { Target, Users, Zap, Shield, Globe, Heart, TrendingUp, Award } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Target,
    title: "Innovation First",
    description: "We constantly push boundaries to solve Africa's unique payment challenges",
    color: "text-[#ef2d10]",
    bg: "bg-[#ef2d10]/10"
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Bank-grade security and compliance are non-negotiable in everything we build",
    color: "text-[#2466eb]",
    bg: "bg-[#2466eb]/10"
  },
  {
    icon: Users,
    title: "Customer Success",
    description: "Your success is our success. We're partners in your growth journey",
    color: "text-success",
    bg: "bg-success/10"
  },
  {
    icon: Heart,
    title: "African Focus",
    description: "Built by Africans, for Africa. We understand the market intimately",
    color: "text-purple-600",
    bg: "bg-purple-600/10"
  }
];

const timeline = [
  {
    year: "2022",
    title: "The Beginning",
    description: "Founded with a mission to simplify African payments"
  },
  {
    year: "2023",
    title: "First 100 Merchants",
    description: "Reached our first major milestone across 5 countries"
  },
  {
    year: "2024",
    title: "Platform Evolution",
    description: "Launched unified API and environment management"
  },
  {
    year: "2025",
    title: "Continental Expansion",
    description: "Now serving 15+ African countries with 1000+ merchants"
  }
];

const team = [
  {
    name: "Dr. Amara Okafor",
    role: "CEO & Co-Founder",
    bio: "Former fintech executive with 15+ years in African payments",
    initials: "AO"
  },
  {
    name: "Jean-Baptiste Kouassi",
    role: "CTO & Co-Founder",
    bio: "Ex-Google engineer passionate about African tech infrastructure",
    initials: "JK"
  },
  {
    name: "Fatima El-Amin",
    role: "Chief Product Officer",
    bio: "Product leader who built payment systems for 50M+ users",
    initials: "FE"
  },
  {
    name: "Kwame Mensah",
    role: "Head of Engineering",
    bio: "Distributed systems expert from Amazon Web Services",
    initials: "KM"
  }
];

const achievements = [
  {
    icon: TrendingUp,
    metric: "$50M+",
    label: "Processed Monthly"
  },
  {
    icon: Users,
    metric: "1000+",
    label: "Active Merchants"
  },
  {
    icon: Globe,
    metric: "15+",
    label: "Countries"
  },
  {
    icon: Award,
    metric: "99.9%",
    label: "Uptime"
  }
];

export default function AboutPage() {
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
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                Mission & Vision
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Born from African payment challenges, built to empower African innovation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="prose prose-lg max-w-none"
            >
              <h2 className="text-3xl font-bold mb-6">Born from African Payment Challenges</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In 2022, we were building a fintech startup in Lagos. Like many African entrepreneurs, we faced a frustrating reality: integrating mobile money payments was a nightmare. Each gateway had different APIs, documentation was scattered, and what worked in sandbox often broke in production.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We spent three months just getting payments to work reliably. Three months that should have been spent building features and serving customers. We knew there had to be a better way.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                That&apos;s when ZitoPay was born. We set out to build the payment infrastructure we wished we had—one platform that would make African payments as simple as they should be. Today, we&apos;re proud to serve over 1,000 merchants across 15 African countries, processing millions in transactions every month.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${value.bg} flex items-center justify-center mb-4`}>
                  <value.icon className={`w-7 h-7 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Milestones that shaped ZitoPay
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#ef2d10] via-[#2466eb] to-success hidden md:block" />

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative flex gap-8 items-start"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#ef2d10] to-[#2466eb] flex items-center justify-center text-white font-bold shadow-lg">
                      {item.year}
                    </div>
                    <div className="flex-1 bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Visionaries</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The team building the future of African payments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ef2d10] to-[#2466eb] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-[#2466eb] font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Milestones & Recognition</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Numbers that tell our story
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[#2466eb]/10 flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-7 h-7 text-[#2466eb]" />
                </div>
                <div className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#ef2d10] to-[#2466eb]">
                  {achievement.metric}
                </div>
                <div className="text-sm text-muted-foreground">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-[#ef2d10] to-[#2466eb] rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Mission
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Be part of the payment revolution transforming Africa
              </p>
              <Link
                href="/get-started"
                className="inline-block px-8 py-4 bg-white text-[#ef2d10] rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Started Today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
