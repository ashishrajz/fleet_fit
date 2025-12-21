import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

import BaseSidebar from "@/components/sidebar/BaseSidebar";
import { dealerNav } from "@/components/sidebar/dealerNav";

export default async function DealerLayout({ children }) {
  const cookieStore = await cookies();
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
    <div className="flex min-h-screen bg-slate-50">
      <BaseSidebar
        navItems={dealerNav}
        profileLink="/dealer/profile"
      />
      {/* UPDATED: Changed ml-20 to ml-64 to match the w-64 Sidebar. 
          Added min-h-screen to ensure background covers full height.
      */}
      <main className="ml-64 w-full min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}