"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    weight: "",
    volume: "",
    boxes: "",
    source: "",
    destination: "",
    deadline: "",
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/shipments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Shipment created");
      router.push(`/warehouse/shipments/${data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create Shipment</h1>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key}
          className="input mb-4"
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
        />
      ))}

      <button
        onClick={handleSubmit}
        className="bg-red-600 text-white px-6 py-3 rounded-xl"
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
