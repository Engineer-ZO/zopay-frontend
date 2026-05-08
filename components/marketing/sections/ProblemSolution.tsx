"use client";

import { motion } from "framer-motion";
import { AlertCircle, TrendingDown, Clock, XCircle, CheckCircle, Zap } from "lucide-react";

const problems = [
    {
        icon: AlertCircle,
        title: "Multiple Gateway Chaos",
        description: "Juggling 5+ different APIs, each with unique documentation and quirks",
        color: "text-error"
    },
    {
        icon: TrendingDown,
        title: "Failed Transactions",
        description: "Lost revenue from payment failures and poor user experience",
        color: "text-warning"
    },
    {
        icon: Clock,
        title: "Manual Reconciliation",
        description: "Hours wasted matching transactions across different platforms",
        color: "text-error"
    },
    {
        icon: XCircle,
        title: "Environment Nightmares",
        description: "Sandbox works perfectly, production breaks everything",
        color: "text-error"
    }
];

const solutions = [
    {
        icon: CheckCircle,
        title: "One Platform, All Gateways",
        description: "Connect once, access MTN MoMo, Orange Money, and more",
        color: "text-success"
    },
    {
        icon: Zap,
        title: "Flawless Transitions",
        description: "Test in sandbox, deploy to production with zero configuration changes",
        color: "text-success"
    },
    {
        icon: CheckCircle,
        title: "Automated Everything",
        description: "Real-time reconciliation, reporting, and compliance built-in",
        color: "text-success"
    }
];

export function ProblemSolution() {
    return (
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 max-w-7xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-[#ef2d10]/10 text-[#ef2d10] mb-4">
                        The Payment Reality
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        In the world of payments,{" "}
                        <span className="text-[#ef2d10]">complexity kills opportunity</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Every failed transaction costs more than just money—it costs trust, growth, and your competitive edge.
                    </p>
                </motion.div>

                {/* Problem Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-4`}>
                                <problem.icon className={`w-6 h-6 ${problem.color}`} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
                            <p className="text-sm text-muted-foreground">{problem.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Transition Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#ef2d10] to-[#2466eb] shadow-2xl">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mt-6 mb-3">
                        ONE SOLUTION
                    </h3>
                    <p className="text-xl text-muted-foreground">
                        One platform. All gateways. Zero headaches.
                    </p>
                </motion.div>

                {/* Solution Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {solutions.map((solution, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-6">
                                <solution.icon className={`w-7 h-7 ${solution.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{solution.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
