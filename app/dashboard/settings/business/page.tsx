import { redirect } from "next/navigation";

/** Legacy route: KYB / environment settings are handled manually; send merchants to support. */
export default function BusinessSettingsRedirectPage() {
    redirect("/dashboard/support");
}
