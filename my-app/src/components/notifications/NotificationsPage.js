"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  const isDealer = pathname.startsWith("/dealer");

  const load = async () => {
    const res = await fetch("/api/notifications", {
      credentials: "include",
    });
    const data = await res.json();
    setItems(data);
  };

  const markRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
    });
  };

  useEffect(() => {
    load();
    markRead();
  }, []);

  const open = (n) => {
    if (!n.relatedId) return;

    if (n.type.startsWith("booking")) {
      router.push("/dealer/requests");
    } else {
      router.push(
        isDealer
          ? `/dealer/trips/${n.relatedId}`
          : `/warehouse/trips/${n.relatedId}`
      );
    }
  };

  if (items.length === 0) {
    return <p className="p-8 text-slate-500">No notifications</p>;
  }

  return (
    <div className="p-8 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {items.map((n) => (
        <div
          key={n._id}
          onClick={() => open(n)}
          className={`p-4 rounded-xl cursor-pointer ${
            n.isRead
              ? "bg-white"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p className="font-medium">{n.message}</p>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(n.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
