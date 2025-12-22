"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DealerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/bookings/dealer", {
        credentials: "include",
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const act = async (id, action, e) => {
    e.stopPropagation(); // 🔥 CRITICAL

    setLoadingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        toast.error("Action failed");
        return;
      }

      toast.success(action === "approve" ? "Approved" : "Rejected");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Booking Requests</h1>

      <div className="space-y-4">
        {requests.map((r) => (
          <div
            key={r._id}
            onClick={() => router.push(`/dealer/shipments/${r.shipment._id}`)}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer transition hover:shadow-md ${
              loadingId === r._id ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {/* Shipment Route */}
            <div className="font-semibold text-lg mb-1">
              {r.shipment.source} → {r.shipment.destination}
            </div>

            {/* Warehouse */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-600">
                From: {r.warehouse.name}
              </span>

              <Link
                href={`/dealer/profile/${r.warehouse._id}`}
                onClick={(e) => e.stopPropagation()} // 🔥 IMPORTANT
                className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100"
              >
                View Profile ↗
              </Link>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={(e) => act(r._id, "approve", e)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Accept
              </button>

              <button
                onClick={(e) => act(r._id, "reject", e)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
