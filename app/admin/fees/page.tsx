import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";

export default function AdminFeesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fee Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/fees/withdrawals" className="group">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Withdrawal Fee Rules</h3>
            <p className="text-sm text-gray-500 mt-2">
              Configure flat fees, percentages, and limits for each withdrawal method type.
            </p>
          </div>
        </Link>

        {/* Placeholder for other fee types */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-400 italic">More fee categories coming soon...</p>
        </div>
      </div>
    </div>
  );
}
