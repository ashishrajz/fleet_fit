"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FullScreenLoader from "../loaders/FullScreenLoader";
import { LogOut, User } from "lucide-react";

export default function BaseSidebar({ navItems, profileLink }) {
  const pathname = usePathname();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const handleNav = (link) => {
    if (!link || typeof link !== "string") return;
    if (pathname === link) return;

    setLoading(true);
    router.push(link);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
  };

  /* ---------------- ACTIVE STATE ---------------- */
  const isActive = (href) => {
    if (!href) return false;

    if (href === "/warehouse" || href === "/dealer") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  /* ---------------- NOTIFICATIONS ---------------- */
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      });
      const data = await res.json();
      setUnread(data.filter((n) => !n.isRead).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const i = setInterval(fetchNotifications, 30000);
    return () => clearInterval(i);
  }, []);

  const profileActive =
    profileLink && pathname.startsWith(profileLink);

  return (
    <>
      {loading && <FullScreenLoader />}

      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`fixed left-0 top-0 h-screen bg-gray-950 border-r border-gray-800
        transition-all duration-300 z-50
        ${expanded ? "w-56" : "w-20"}`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center">
          <div className="w-10 h-10 bg-red-600 rounded-xl" />
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems
            .filter(item => item?.href)
            .map((item) => {
              const active = isActive(item.href);

              return (
                <button
                  key={item.label}
                  onClick={() => handleNav(item.href)}
                  className={`relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all
                  ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {expanded && (
                    <span className="font-medium">{item.label}</span>
                  )}

                  {item.label === "Notifications" &&
                    unread > 0 &&
                    expanded && (
                      <span className="ml-auto bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {unread}
                      </span>
                    )}
                </button>
              );
            })}
        </nav>

        {/* BOTTOM */}
        <div className="absolute bottom-6 w-full px-3 flex flex-col gap-2">
          <button
            onClick={() => handleNav(profileLink)}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl
            ${
              profileActive
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <User className="w-5 h-5" />
            {expanded && <span>Profile</span>}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
