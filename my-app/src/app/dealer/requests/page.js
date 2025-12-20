"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DealerRequestsPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await fetch("/api/bookings/dealer", {
      credentials: "include",
    });
    setRequests(await res.json());
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const act = async (id, action) => {
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

    toast.success(`Request ${action}`);
    fetchRequests();
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">
        Booking Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-slate-500">
          No pending requests
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r._id}
              className="bg-white p-6 rounded-xl shadow flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  {r.shipment.source} →{" "}
                  {r.shipment.destination}
                </p>

                <Link
                  href={`/dealer/profile/${r.warehouse._id}`}
                  className="text-red-600"
                >
                  {r.warehouse.name}
                </Link>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    act(r._id, "approve")
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    act(r._id, "reject")
                  }
                  className="bg-red-100 text-red-600 px-4 py-2 rounded"
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
