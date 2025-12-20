"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DealerTrucksPage() {
  const [trucks, setTrucks] = useState([]);

  const fetchTrucks = async () => {
    const res = await fetch("/api/trucks", { credentials: "include" });
    setTrucks(await res.json());
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Trucks</h1>

        <Link
          href="/dealer/trucks/new"
          className="bg-red-600 text-white px-5 py-3 rounded-xl font-semibold"
        >
          + Add Truck
        </Link>
      </div>

      {trucks.length === 0 ? (
        <p className="text-slate-500">No trucks added yet</p>
      ) : (
        <div className="grid gap-4">
          {trucks.map((t) => (
            <Link
              key={t._id}
              href={`/dealer/trucks/${t._id}`}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  {t.truckType} — #{t.number}
                </p>
                <p className="text-sm text-slate-500">
                  {t.maxWeight}kg • {t.maxVolume}m³
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">₹{t.costPerKm}/km</p>
                <p
                  className={`text-sm font-medium ${
                    t.isAvailable
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {t.isAvailable ? "Available" : "Busy"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
