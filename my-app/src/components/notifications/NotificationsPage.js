"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BellRing,
  Truck,
  CalendarDays,
  Info,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isDealer = pathname.startsWith("/dealer");

  // 1. Inject styles safely on the client side
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Existing Ring Animation (Fast shake for new alerts) */
      @keyframes ring {
        0% { transform: rotate(0); }
        10% { transform: rotate(30deg); }
        20% { transform: rotate(-28deg); }
        30% { transform: rotate(34deg); }
        40% { transform: rotate(-32deg); }
        50% { transform: rotate(30deg); }
        60% { transform: rotate(-28deg); }
        70% { transform: rotate(26deg); }
        80% { transform: rotate(-24deg); }
        90% { transform: rotate(22deg); }
        100% { transform: rotate(0); }
      }
      
      /* NEW: Swing Animation (Slow sway for empty state) */
      @keyframes swing {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(15deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-15deg); }
        100% { transform: rotate(0deg); }
      }

      .bell-shake {
        animation: ring 2s ease-in-out infinite;
        transform-origin: top center;
      }
      
      .bell-swing {
        animation: swing 3s ease-in-out infinite;
        transform-origin: top center;
      }

      .group:hover .bell-hover-shake {
        animation: ring 2s ease-in-out infinite;
        transform-origin: top center;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
      });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark read");
    }
  };

  useEffect(() => {
    load();
    const timer = setTimeout(() => markRead(), 2000);
    return () => clearTimeout(timer);
  }, []);

  const open = (n) => {
    if (!n.relatedId) return;

    if (n.type && n.type.startsWith("booking")) {
      router.push("/dealer/requests");
    } else {
      router.push(
        isDealer
          ? `/dealer/trips/${n.relatedId}`
          : `/warehouse/trips/${n.relatedId}`
      );
    }
  };

  const getIconInfo = (type) => {
    let icon = <Info className="w-5 h-5 text-gray-500" />;
    let bg = "bg-gray-100";

    if (!type) return { icon, bg };

    if (type.startsWith("booking")) {
      icon = <CalendarDays className="w-5 h-5 text-red-500" />;
      bg = "bg-red-50";
    } else if (type.startsWith("trip")) {
      icon = <Truck className="w-5 h-5 text-blue-500" />;
      bg = "bg-blue-50";
    } else if (type === "success") {
      icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
      bg = "bg-green-50";
    } else {
      icon = <BellRing className="w-5 h-5 text-red-400" />;
      bg = "bg-red-50";
    }
    return { icon, bg };
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="p-2 bg-red-100 rounded-xl">
                 <BellRing className={`w-6 h-6 text-red-500 ${!loading && items.length > 0 ? 'bell-shake' : ''}`} />
            </div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
           {!loading && items.length > 0 && <span className="px-2 py-0.5 text-sm bg-red-100 text-red-600 rounded-full font-medium">{items.length} new</span>}
        </div>

        {/* Skeleton Loader */}
        {loading && (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
              ))}
            </div>
        )}

        {/* Empty State with Moving Bell */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            {/* Added 'bell-swing' class here */}
            <BellRing className="w-10 h-10 text-gray-300 mx-auto mb-3 bell-swing" />
            <p className="text-gray-500 font-medium">No new notifications</p>
            <p className="text-sm text-gray-400">We'll let you know when something happens.</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {!loading && items.map((n) => {
            const { icon, bg } = getIconInfo(n.type);
            return (
              <div
                key={n._id}
                onClick={() => open(n)}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg
                  ${
                    !n.isRead
                      ? "bg-white border-red-200 shadow-sm"
                      : "bg-gray-50/80 border-transparent hover:bg-white hover:border-gray-100"
                  }`}
              >
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}

                <div className={`mt-1 p-2.5 rounded-full shrink-0 transition-colors ${!n.isRead ? bg : 'bg-white border border-gray-100 group-hover:border-gray-200'}`}>
                  <div className={!n.type ? "bell-hover-shake" : ""}>
                    {icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-[15px] leading-snug ${!n.isRead ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 font-medium">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                <div className="self-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-red-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}