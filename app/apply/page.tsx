import Link from "next/link";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/constants/api";

async function getMerchantRegistrationConfig(): Promise<{ allowSelfRegistration: boolean; applicationFormUrl: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/v1/config/merchant-registration`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as { allowSelfRegistration: boolean; applicationFormUrl: string };
  } catch {
    return null;
  }
}

export default async function ApplyPage() {
  const config = await getMerchantRegistrationConfig();

  const applicationFormUrl = config?.applicationFormUrl;

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-background rounded-2xl shadow-xl border border-border p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Apply to become a merchant</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Merchant self-registration is currently disabled. Submit your application and our team will review it.
              </p>
            </div>
            <Link
              href="/login"
              className="shrink-0 px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-background hover:bg-muted transition-colors"
            >
              Log in
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {applicationFormUrl ? (
              <a
                href={applicationFormUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.01] flex items-center justify-center gap-2 bg-[#2466eb] text-white hover:bg-[#1f57c9]"
              >
                Apply Now
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 bg-muted text-muted-foreground cursor-not-allowed"
              >
                Apply Now
              </button>
            )}

            {!applicationFormUrl && (
              <p className="text-xs text-muted-foreground">
                Application form URL is not configured yet. Please contact support.
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#2466eb] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
