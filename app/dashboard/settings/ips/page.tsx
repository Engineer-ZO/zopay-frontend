import { redirect } from "next/navigation";

export default function IpsRedirectPage() {
    redirect("/dashboard/settings/network-access?tab=ips");
}
