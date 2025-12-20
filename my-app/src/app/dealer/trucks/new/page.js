"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddTruckPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    number: "",
    truckType: "",
    maxWeight: "",
    maxVolume: "",
    costPerKm: "",
  });

  const submit = async () => {
    if (!form.truckType) {
      toast.error("Select truck type");
      return;
    }

    const res = await fetch("/api/trucks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast.error("Failed to add truck");
      return;
    }

    toast.success("Truck added");
    router.push("/dealer/trucks");
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Truck</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <input
          placeholder="Truck Number"
          className="input"
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
        />

        <select
          className="input"
          value={form.truckType}
          onChange={(e) => setForm({ ...form, truckType: e.target.value })}
        >
          <option value="">Select Truck Type</option>
          <option value="Mini Truck">Mini Truck</option>
          <option value="Pickup">Pickup</option>
          <option value="Container">Container</option>
          <option value="Trailer">Trailer</option>
        </select>

        <input
          type="number"
          placeholder="Max Weight (kg)"
          className="input"
          value={form.maxWeight}
          onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
        />

        <input
          type="number"
          placeholder="Max Volume (m³)"
          className="input"
          value={form.maxVolume}
          onChange={(e) => setForm({ ...form, maxVolume: e.target.value })}
        />

        <input
          type="number"
          placeholder="Cost per km"
          className="input"
          value={form.costPerKm}
          onChange={(e) => setForm({ ...form, costPerKm: e.target.value })}
        />

        <button
          onClick={submit}
          className="bg-red-600 text-white py-3 rounded-xl font-semibold w-full"
        >
          Add Truck
        </button>
      </div>
    </div>
  );
}
