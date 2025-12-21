"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Truck,
  Weight,
  Box,
  IndianRupee,
  Save,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";

// Consistent Image Mapping
const TRUCK_IMAGES = {
  default: "https://images.unsplash.com/photo-1586154684393-27c9e078519e?auto=format&fit=crop&w=1200&q=80",
  "Mini Truck": "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=1200&q=80",
  "Pickup": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
  "Container": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
  "Trailer": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
};

export default function TruckDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [truck, setTruck] = useState(null);

  // Form State
  const [form, setForm] = useState({
    costPerKm: "",
    isAvailable: true,
  });

  // Get Image based on type
  const getHeaderImage = (type) => TRUCK_IMAGES[type] || TRUCK_IMAGES.default;

  const fetchTruck = async () => {
    try {
      const res = await fetch(`/api/trucks/${id}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load truck");

      const data = await res.json();

      setTruck(data.truck || data); // Handle both wrapped and unwrapped responses
      setForm({
        costPerKm: data.truck?.costPerKm ?? data.costPerKm ?? "",
        isAvailable: data.truck?.isAvailable ?? data.isAvailable ?? true,
      });
    } catch (err) {
      toast.error("Failed to load truck data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTruck();
  }, [id]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/trucks/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Truck updated successfully");
      fetchTruck(); // Refresh data
    } catch (error) {
      toast.error("Failed to update truck");
    } finally {
      setSaving(false);
    }
  };

  // Loading Skeleton
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  if (!truck) return (
    <div className="p-12 text-center">
      <h2 className="text-xl font-bold text-gray-800">Truck not found</h2>
      <Link href="/dealer/trucks" className="text-red-600 hover:underline mt-2 inline-block">
        Return to Fleet
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation */}
        <Link 
          href="/dealer/trucks" 
          className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors gap-2 font-medium mb-4"
        >
          <ArrowLeft size={20} />
          Back to Fleet
        </Link>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: Visuals & Status */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-white"
            >
              <div className="h-56 relative">
                <img 
                  src={getHeaderImage(truck.truckType)} 
                  alt={truck.truckType} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium opacity-80">{truck.truckType}</p>
                  <h1 className="text-2xl font-bold tracking-tight text-white">{truck.number}</h1>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-medium text-sm">Current Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    form.isAvailable 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}>
                    {form.isAvailable ? "Active & Ready" : "Currently Busy"}
                  </span>
                </div>
                
                {/* Modern Toggle Switch */}
                <div 
                  onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                  className={`
                    w-full cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                    ${form.isAvailable 
                      ? "border-green-500 bg-green-50/30" 
                      : "border-orange-500 bg-orange-50/30"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {form.isAvailable 
                      ? <CheckCircle2 className="text-green-600" /> 
                      : <XCircle className="text-orange-600" />
                    }
                    <span className={`font-semibold ${form.isAvailable ? "text-green-800" : "text-orange-800"}`}>
                      {form.isAvailable ? "Mark as Busy" : "Mark as Available"}
                    </span>
                  </div>
                  
                  {/* Toggle UI */}
                  <div className={`
                    w-12 h-6 rounded-full relative transition-colors duration-200
                    ${form.isAvailable ? "bg-green-500" : "bg-gray-300"}
                  `}>
                    <motion.div 
                      layout
                      className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm"
                      animate={{ x: form.isAvailable ? 24 : 0 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COL: Specs & Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Specs Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="text-red-500" size={20} />
                Vehicle Specifications
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                      <Weight size={20} />
                    </div>
                    <span className="text-sm text-gray-500 font-semibold uppercase">Max Load</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{truck.maxWeight} <span className="text-sm text-gray-400">kg</span></p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                      <Box size={20} />
                    </div>
                    <span className="text-sm text-gray-500 font-semibold uppercase">Volume</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{truck.maxVolume} <span className="text-sm text-gray-400">m³</span></p>
                </div>
              </div>
            </motion.div>

            {/* Pricing Edit Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
               <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <IndianRupee className="text-red-500" size={20} />
                Pricing Configuration
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Cost Rate (per km)
                  </label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-red-500 outline-none font-bold text-lg text-gray-800 transition-all"
                      value={form.costPerKm}
                      onChange={(e) => setForm({ ...form, costPerKm: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 ml-1">
                    This rate will be used to calculate shipping quotes for customers.
                  </p>
                </div>

                <hr className="border-gray-100" />

                <div className="flex justify-end">
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className={`
                      flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-red-500/30 transition-all
                      ${saving ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"}
                    `}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}