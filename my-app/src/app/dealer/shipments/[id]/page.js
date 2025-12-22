"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Package, MapPin, Milestone } from "lucide-react";

import { cities, getDistance } from "@/app/warehouse/shipments/new/database";

export default function DealerShipmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [shipment, setShipment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dealer/shipments/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setShipment(data.shipment);
        setBooking(data.booking);
      } catch {
        alert("Failed to load shipment");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const act = async (action) => {
    if (!booking || actionLoading) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        alert("Action failed");
        return;
      }

      setBooking((prev) => ({
        ...prev,
        status: action === "approve" ? "approved" : "rejected",
      }));

      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !shipment) {
    return <div className="p-8">Loading...</div>;
  }

  /* -------- Distance (DISPLAY ONLY) -------- */
  let distance = shipment.distance;
  if (!distance) {
    const sourceCity = cities.find((c) => c.name === shipment.source);
    const destCity = cities.find((c) => c.name === shipment.destination);
    if (sourceCity && destCity) {
      distance = getDistance(
        sourceCity.lat,
        sourceCity.lon,
        destCity.lat,
        destCity.lon
      );
    }
  }

  /* -------- PRICE (LOCKED FROM DB) -------- */
  const estimatedCost = booking?.finalPrice ?? null;

  /* 🔥 FIXED LOGIC — THIS WAS THE BUG */
  const isPending =
    booking && !["approved", "rejected"].includes(booking.status);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shipment Details</h1>
        <p className="text-slate-500 mt-1">
          Shipment information provided by warehouse
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow border">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-red-600" />
                <h2 className="text-xl font-semibold">Route</h2>
              </div>
              {distance && (
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full">
                  <Milestone className="w-4 h-4 text-red-400" />
                  <span className="font-bold">{distance} km</span>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <div>
                <p className="text-xs text-slate-400">SOURCE</p>
                <p className="font-semibold">{shipment.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 text-right">
                  DESTINATION
                </p>
                <p className="font-semibold">{shipment.destination}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-red-600" />
              <h2 className="text-xl font-semibold">Shipment Info</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <Info label="Weight" value={`${shipment.weight} kg`} />
              <Info label="Volume" value={`${shipment.volume} m³`} />
              <Info label="Boxes" value={shipment.boxes} />
              <Info
                label="Deadline"
                value={new Date(shipment.deadline).toDateString()}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-xl shadow p-6 h-fit space-y-6">
          <div>
            <h3 className="font-semibold mb-1">Warehouse</h3>
            <Link
              href={`/dealer/profile/${shipment.warehouse._id}`}
              className="text-lg font-semibold text-red-600"
            >
              {shipment.warehouse.name}
            </Link>
          </div>

          {estimatedCost !== null && (
            <div className="border-t pt-4">
              <p className="text-sm text-slate-500 mb-1">
                Estimated Trip Cost
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹ {estimatedCost.toLocaleString()}
              </p>
            </div>
          )}

          {booking && (
            <div className="border-t pt-4 flex gap-3">
              <button
                disabled={!isPending || actionLoading}
                onClick={() => act("approve")}
                className={`px-5 py-2 rounded-lg font-medium ${
                  isPending
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                Accept
              </button>

              <button
                disabled={!isPending || actionLoading}
                onClick={() => act("reject")}
                className={`px-5 py-2 rounded-lg font-medium ${
                  isPending
                    ? "bg-red-100 hover:bg-red-200 text-red-700"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
