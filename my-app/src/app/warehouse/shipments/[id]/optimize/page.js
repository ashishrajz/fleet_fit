"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OptimizePage() {
  const { id } = useParams(); // shipmentId
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const runOptimization = async () => {
      try {
        const res = await fetch(
          `/api/shipments/${id}/optimize`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setResults(data);
      } catch (err) {
        toast.error(err.message || "Optimization failed");
      } finally {
        setLoading(false);
      }
    };

    runOptimization();
  }, [id]);

  const sendRequest = async (truckId) => {
    const res = await fetch("/api/bookings/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId: id,
        truckId,
      }),
    });
  
    if (!res.ok) {
      toast.error("Failed to send request");
      return;
    }
  
    toast.success("Booking request sent");
  };
  

  if (loading) {
    return <p className="p-8">Optimizing trucks…</p>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Optimized Truck Matches
      </h1>

      {results.length === 0 && (
        <p className="text-slate-500">
          No suitable trucks found.
        </p>
      )}

      <div className="space-y-5">
        {results.map((r) => (
          <div
            key={r.truck._id}
            className="bg-white p-6 rounded-2xl shadow flex justify-between items-center"
          >
            {/* LEFT — CLICKABLE */}
            <Link
              href={`/warehouse/trucks/${r.truck._id}`}
              onClick={() =>
                localStorage.setItem("activeShipment", id)
              }
              className="flex-1 hover:opacity-90"
            >
              <p className="text-lg font-semibold">
                {r.truck.truckType}
              </p>

              <p className="text-sm text-slate-500">
                Dealer:{" "}
                <span className="text-red-600 font-medium">
                  {r.dealer?.name || "Unknown Dealer"}
                </span>
              </p>

              <p className="text-sm">
                Utilization: {r.utilization}%
              </p>

              <p className="text-sm">
                Estimated Cost: ₹{r.costEstimate}
              </p>

              <p className="text-sm">
                ⭐ Rating: {r.rating}
              </p>
            </Link>

            {/* RIGHT — ACTION */}
            <button
              onClick={() => sendRequest(r.truck._id)}
              className="ml-6 bg-red-600 text-white px-5 py-2 rounded-xl"
            >
              Request Truck
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
