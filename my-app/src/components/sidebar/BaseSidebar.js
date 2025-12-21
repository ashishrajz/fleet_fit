"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Box, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import FullScreenLoader from "../loaders/FullScreenLoader";
import { FaTruckFast } from "react-icons/fa6";

// Utility for clean classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function BaseSidebar({ navItems, profileLink }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  // --- LOGIC ---
  const handleNav = (link) => {
    if (!link || typeof link !== "string") return;
    if (pathname === link) return;
    setLoading(true);
    router.push(link);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isActive = (href) => {
    if (!href) return false;
    // Prevent root paths (like /dealer or /warehouse) from lighting up for sub-pages
    if (href === "/dealer" || href === "/warehouse") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      const data = await res.json();
      setUnread(data.filter((n) => !n.isRead).length);
    } catch (e) {
      // silent fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const i = setInterval(fetchNotifications, 30000);
    return () => clearInterval(i);
  }, []);

  // --- ANIMATION VARIANTS ---
  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <>
      {loading && <FullScreenLoader />}

      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col w-[280px] bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-xl shadow-slate-200/40"
      >
        {/* HEADER */}
        <div className="h-28 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-4 cursor-default">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20 text-white"
            >
              <FaTruckFast size={22} strokeWidth={2.5} />
            </motion.div>
            
            <div className="flex flex-col">
              <h1 className="font-bold text-slate-900 text-xl tracking-tight leading-none">
                FleetFit
              </h1>
             
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 flex flex-col gap-1.5 px-4 overflow-y-auto no-scrollbar py-2">
          {navItems
            ?.filter((item) => item?.href)
            .map((item) => {
              const active = isActive(item.href);
              // Checks for both specific notification types so it works for Dealer OR Warehouse
              const isNotification = item.label === "Booking Requests" || item.label === "Notifications" || item.label === "Requests";

              return (
                <motion.button
                  key={item.label}
                  variants={itemVariants}
                  onClick={() => handleNav(item.href)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 w-full overflow-hidden",
                    active ? "text-white shadow-lg shadow-rose-500/25" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {/* Sliding Active Background */}
                  {active && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Hover Background (Inactive only) */}
                  {!active && (
                    <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 shrink-0 flex items-center justify-center">
                    <item.icon
                      size={22}
                      strokeWidth={active ? 2.5 : 2}
                      className={cn(
                        "transition-colors duration-300",
                        active ? "text-white" : "text-slate-400 group-hover:text-rose-500"
                      )}
                    />
                    
                    {/* Notification Dot (on Icon) */}
                    {isNotification && unread > 0 && !active && (
                       <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-2.5 w-2.5">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                       </span>
                    )}
                  </div>

                  {/* Label & Count */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className={cn(
                      "text-[15px] font-medium tracking-wide transition-colors",
                      active ? "font-semibold" : ""
                    )}>
                      {item.label}
                    </span>
                    
                    {isNotification && unread > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "flex h-5 w-auto min-w-[20px] px-1.5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                          active ? "bg-white text-rose-600" : "bg-rose-100 text-rose-600"
                        )}
                      >
                        {unread}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              );
            })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 mx-4 mb-4 border-t border-slate-100">
           <motion.button
              whileHover={{ x: 5 }}
              onClick={handleLogout}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-rose-100 transition-colors">
                 <LogOut size={18} strokeWidth={2.5} className="shrink-0" />
              </div>
              <span className="text-[14px] font-semibold whitespace-nowrap">
                Sign Out
              </span>
              <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
        </div>
      </motion.aside>
    </>
  );
}