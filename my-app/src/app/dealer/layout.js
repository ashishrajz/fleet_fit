import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

import BaseSidebar from "@/components/sidebar/BaseSidebar";
import { dealerNav } from "@/components/sidebar/dealerNav";

export default async function DealerLayout({ children }) {
  const cookieStore = await cookies(); // ✅ MUST await
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  try {
    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
      redirect("/unauthorized");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex">
      <BaseSidebar
        navItems={dealerNav}
        profileLink="/dealer/profile"
      />
      <main className="ml-20 w-full">{children}</main>
    </div>
  );
}
