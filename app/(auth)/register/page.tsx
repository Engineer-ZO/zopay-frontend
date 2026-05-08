import { redirect } from "next/navigation";

export default async function RegisterPage() {
  // Account creation is admin-only. Keep this route for backward compatibility,
  // but always send users to the application form instead.
  redirect("/apply");
}
