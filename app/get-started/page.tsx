import { redirect } from "next/navigation";

export default async function GetStartedPage() {
  // Account creation is admin-only. Redirect users to the application form.
  redirect("/apply");
}
