"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { useCreateMerchant } from "@/features/merchants/hooks";

export default function MerchantSetupPage() {
    const router = useRouter();
    const { mutate: createMerchant, isPending } = useCreateMerchant();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: "",
        phone: "",
        country: "CM",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createMerchant(
            {
                businessName: formData.businessName,
                phone: formData.phone,
                country: formData.country,
            },
            {
                onSuccess: (data) => {
                    // Store merchant credentials
                    console.log("Merchant created:", data.merchant);
                    // Redirect to dashboard
                    router.push("/dashboard");
                },
                onError: (error) => {
                    console.error("Failed to create merchant:", error);
                    alert(`Error: ${error.message}`);
                },
            }
        );
    };



    return (
        <AuthLayout>
            <div className="w-full max-w-2xl">
                <div className="bg-background rounded-2xl shadow-xl border border-border p-6 sm:p-8">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-[#ef2d10] text-white' : 'bg-muted text-muted-foreground'}`}>
                                <Building2 className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-medium ${currentStep === 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Business Info
                            </span>
                        </div>

                        <div className="flex-1 h-px bg-border mx-3" />

                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-[#ef2d10] text-white' : 'bg-muted text-muted-foreground'}`}>
                                <FileText className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-medium ${currentStep === 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Contact Details
                            </span>
                        </div>

                        <div className="flex-1 h-px bg-border mx-3" />

                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-[#ef2d10] text-white' : 'bg-muted text-muted-foreground'}`}>
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-medium ${currentStep === 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                Verification
                            </span>
                        </div>
                    </div>

                    {/* Form Header */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-foreground mb-2">
                            Tell us about your business
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Step 1 of 4. Please provide your official business registration details.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Business Name */}
                            <div>
                                <label htmlFor="businessName" className="block text-xs font-medium text-foreground mb-2">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    id="businessName"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your legal business name"
                                    required
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone" className="block text-xs font-medium text-foreground mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+237 670 000 000"
                                    required
                                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Business Country */}
                        <div>
                            <label htmlFor="country" className="block text-xs font-medium text-foreground mb-2">
                                Business Country
                            </label>
                            <select
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#ef2d10] focus:border-transparent transition-all"
                            >
                                <option value="CM">Cameroon</option>
                                <option value="NG">Nigeria</option>
                                <option value="GH">Ghana</option>
                                <option value="KE">Kenya</option>
                                <option value="ZA">South Africa</option>
                            </select>
                        </div>



                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3 bg-[#2563eb] text-white rounded-lg font-semibold text-sm hover:bg-[#1d4ed8] transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Continue to Contact Details
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Terms */}
                        <p className="text-xs text-center text-muted-foreground">
                            By continuing, you agree to ZitoPay&apos;s{" "}
                            <a href="/terms" className="text-[#2563eb] hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-[#2563eb] hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
}
