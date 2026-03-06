import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";

export default async function AuthRedirectPage() {
  const admin = await isAdmin();

  if (admin) {
    redirect("/admin");
  }

  redirect("/dashboard");
}
