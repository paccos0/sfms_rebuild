import { redirect } from "next/navigation";
import { getSessionUserFromCookies } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "student" || user.role === "parent") {
    redirect("/portal/dashboard");
  }

  redirect("/dashboard");
}