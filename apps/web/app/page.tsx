import { redirect } from "next/navigation";

export default async function RootPage() {
  // Root page redirects to dashboard - middleware will handle auth check
  redirect("/dashboard");
}
