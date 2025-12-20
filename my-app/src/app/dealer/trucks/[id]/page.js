"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function TruckDetailPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [truck, setTruck] = useState(null);

  // 🔥 FORM STATE (separate from truck)
  const [form, setForm] = useState({
    costPerKm: "",
    isAvailable: true,
  });

  const fetchTruck = async () => {
    try {
      const res = await fetch(`/api/trucks/${id}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load truck");

      const data = await res.json();

      setTruck(data.truck);
      setForm({
        costPerKm: data.truck.costPerKm ?? "",
        isAvailable: data.truck.isAvailable ?? true,
      });
    } catch (err) {
      toast.error("Failed to load truck");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTruck();
  }, [id]);

  const saveChanges = async () => {
    const res = await fetch(`/api/trucks/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast.error("Failed to update truck");
      return;
    }

    toast.success("Truck updated");
    fetchTruck();
  };

  if (loading) return <p className="p-8">Loading truck…</p>;
  if (!truck) return <p className="p-8 text-red-500">Truck not found</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">
          {truck.truckType} — #{truck.number}
        </h1>
        <p className="text-slate-500 mt-1">
          Capacity: {truck.maxWeight}kg • {truck.maxVolume}m³
        </p>
      </div>

      {/* STATUS */}
      <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Availability</p>
          <p
            className={`font-semibold ${
              truck.isAvailable
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {truck.isAvailable ? "Available" : "Assigned"}
          </p>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) =>
              setForm({
                ...form,
                isAvailable: e.target.checked,
              })
            }
          />
          Toggle Availability
        </label>
      </div>

      {/* EDIT FORM */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">
          Pricing
        </h2>

        <div>
          <label className="block text-sm mb-1">
            Cost per km
          </label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={form.costPerKm}
            onChange={(e) =>
              setForm({
                ...form,
                costPerKm: e.target.value,
              })
            }
          />
        </div>

        <button
          onClick={saveChanges}
          className="bg-red-600 text-white px-5 py-2 rounded-xl"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
