import { redirect } from "next/navigation";

export default function DomainsRedirectPage() {
    redirect("/dashboard/settings/network-access?tab=domains");
}
