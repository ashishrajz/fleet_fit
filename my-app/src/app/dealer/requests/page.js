"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DealerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null); // Tracks which specific ID is processing

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/bookings/dealer", {
        credentials: "include",
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const act = async (id, action) => {
    setLoadingId(id); // 1. Start loading visual
    
    try {
      const res = await fetch(`/api/bookings/${id}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        toast.error("Action failed");
        setLoadingId(null);
        return;
      }

      toast.success(`Request ${action === "approve" ? "Approved" : "Rejected"}`);

      // 2. Optimistic Update: Remove item immediately from UI without waiting for re-fetch
      setRequests((prev) => prev.filter((r) => r._id !== id));

    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoadingId(null); // Stop loading visual
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Booking Requests</h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {requests.length} Pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 text-lg">No pending requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r._id}
              className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-200 ${
                loadingId === r._id ? "opacity-50 pointer-events-none" : "hover:shadow-md"
              }`}
            >
              {/* Left Side: Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-gray-800">
                    {r.shipment.source}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-lg text-gray-800">
                    {r.shipment.destination}
                  </span>
                </div>

                <div className="text-sm text-slate-500 mb-2">
                   Request ID: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{r._id.slice(-6)}</span>
                </div>

                {/* 3. New Contact Profile Button */}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-slate-600">From: {r.warehouse.name}</span>
                    <Link
                    href={`/dealer/profile/${r.warehouse._id}`} // Adjust route as needed
                    className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                    View Contact Profile ↗
                    </Link>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => act(r._id, "approve")}
                  disabled={loadingId === r._id}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70 flex justify-center min-w-[100px]"
                >
                  {loadingId === r._id ? (
                    <span className="animate-pulse">Wait...</span>
                  ) : (
                    "Accept"
                  )}
                </button>
                
                <button
                  onClick={() => act(r._id, "reject")}
                  disabled={loadingId === r._id}
                  className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}