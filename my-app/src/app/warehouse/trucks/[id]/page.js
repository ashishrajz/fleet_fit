"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TruckDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/trucks/${id}`)
      .then((res) => res.json())
      .then(setData);
  }, [id]);

  const sendRequest = async () => {
    const shipmentId = localStorage.getItem("activeShipment");
  
    const res = await fetch("/api/bookings/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId,
        truckId: id,
      }),
    });
  
    if (!res.ok) {
      toast.error("Request failed");
      return;
    }
  
    toast.success("Request sent");
  };
  

  if (!data) return <p className="p-8">Loading...</p>;

  const { truck, dealer, avgRating } = data;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Truck Card */}
      <div className="bg-white rounded-2xl p-8 shadow">
        <h1 className="text-3xl font-bold">
          {truck.truckType}
        </h1>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <Stat label="Max Weight" value={`${truck.maxWeight} kg`} />
          <Stat label="Max Volume" value={`${truck.maxVolume} m³`} />
          <Stat label="Cost / km" value={`₹${truck.costPerKm}`} />
        </div>
      </div>

      {/* Dealer Card */}
      <div className="bg-white rounded-2xl p-8 shadow flex justify-between">
        <div>
          <p className="text-slate-500 text-sm">Dealer</p>
          <Link
            href={`/warehouse/profile/${dealer._id}`}
            className="text-xl font-semibold text-red-600"
          >
            {dealer.name}
          </Link>
          <p className="text-slate-500 mt-1">
            ⭐ {avgRating} average rating
          </p>
        </div>

        <button
          onClick={sendRequest}
          className="bg-red-600 text-white px-6 py-3 rounded-xl"
        >
          Send Booking Request
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
