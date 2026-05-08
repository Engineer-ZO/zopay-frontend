import { redirect } from "next/navigation";

/** Merchant gateway configuration UI removed per product decision; legacy URL preserved. */
export default function GatewaysRedirectPage() {
    redirect("/dashboard");
}
