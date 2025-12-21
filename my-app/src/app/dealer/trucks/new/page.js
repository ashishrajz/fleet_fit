"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Weight,
  Box,
  IndianRupee,
  Hash,
  Loader2,
  ImageIcon,
  ChevronDown,
  Check,
  Package,
  Container
} from "lucide-react";

const TRUCK_IMAGES = {
  default: "https://images.unsplash.com/photo-1586154684393-27c9e078519e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "Mini Truck": "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "Pickup": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "Container": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "Trailer": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
};

const TRUCK_OPTIONS = [
  { id: "Mini Truck", label: "Mini Truck", icon: Truck, desc: "Small loads < 1 Ton" },
  { id: "Pickup", label: "Pickup", icon: Package, desc: "Open body, medium load" },
  { id: "Container", label: "Container", icon: Box, desc: "Closed body, secure" },
  { id: "Trailer", label: "Trailer", icon: Container, desc: "Heavy haulage" },
];

function TruckSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = TRUCK_OPTIONS.find((opt) => opt.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 flex items-center justify-between
          bg-white border-2 rounded-xl cursor-pointer transition-all duration-200
          ${isOpen ? "border-red-500 ring-2 ring-red-100" : "border-gray-100 hover:border-red-200"}
        `}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <selectedOption.icon size={20} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-gray-800 text-sm">{selectedOption.label}</span>
                <span className="text-xs text-gray-400">{selectedOption.desc}</span>
              </div>
            </>
          ) : (
            <span className="text-gray-400 font-medium ml-1">Select Vehicle Type...</span>
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-gray-400" size={20} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto p-1">
              {TRUCK_OPTIONS.map((option) => {
                const isSelected = value === option.id;
                const Icon = option.icon;

                return (
                  <div
                    key={option.id}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                    }}
                    className={`
                      flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors
                      ${isSelected ? "bg-red-50" : "hover:bg-gray-50"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-white text-red-600 shadow-sm" : "bg-gray-100 text-gray-500"}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? "text-red-700" : "text-gray-700"}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-400">{option.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-red-600" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AddTruckPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    number: "",
    truckType: "",
    maxWeight: "",
    maxVolume: "",
    costPerKm: "",
  });

  const getHeaderImage = () =>
    TRUCK_IMAGES[form.truckType] || TRUCK_IMAGES.default;

  const submit = async () => {
    if (!form.truckType || !form.number) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/trucks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add truck");

      toast.success("Truck added successfully!");
      setTimeout(() => router.push("/dealer/trucks"), 500);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-sans">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="relative h-48 overflow-hidden bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.img
              key={form.truckType || "default"}
              src={getHeaderImage()}
              alt="Truck Preview"
              onError={(e) => {
                e.currentTarget.src = TRUCK_IMAGES.default;
              }}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/40 to-transparent" />

          <div className="absolute bottom-0 left-0 p-8 z-10 text-white w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={form.truckType ? "title-change" : "title-default"}
            >
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {form.truckType ? (
                  <>
                    <ImageIcon className="w-6 h-6 text-red-200" />
                    {form.truckType}
                  </>
                ) : (
                  <>
                    <Truck className="w-8 h-8" />
                    Add New Truck
                  </>
                )}
              </h1>
              <p className="text-red-100 mt-1 text-sm opacity-90">
                {form.truckType
                  ? `Configuration set for ${form.truckType} vehicle.`
                  : "Select a type below to see vehicle preview."}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="p-8 space-y-5">
          <motion.div variants={itemVariants} className="group relative z-20">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Truck Configuration
            </label>
            
            <TruckSelect 
              value={form.truckType}
              onChange={(value) => setForm({ ...form, truckType: value })}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
              Vehicle Registration
            </label>
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100 group-focus-within:border-red-500 group-focus-within:bg-white transition-all">
              <Hash className="text-gray-400 group-focus-within:text-red-500 mr-3" size={20} />
              <input
                placeholder="Ex: UP 65 AB 1234"
                className="bg-transparent w-full outline-none text-gray-800 font-medium"
                value={form.number}
                onChange={(e) =>
                  setForm({ ...form, number: e.target.value })
                }
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="group">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                Max Load
              </label>
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100 group-focus-within:border-red-500 group-focus-within:bg-white transition-all">
                <Weight className="text-gray-400 group-focus-within:text-red-500 mr-3" size={20} />
                <input
                  type="number"
                  placeholder="Kg"
                  className="bg-transparent w-full outline-none text-gray-800 font-medium"
                  value={form.maxWeight}
                  onChange={(e) =>
                    setForm({ ...form, maxWeight: e.target.value })
                  }
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="group">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                Volume
              </label>
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100 group-focus-within:border-red-500 group-focus-within:bg-white transition-all">
                <Box className="text-gray-400 group-focus-within:text-red-500 mr-3" size={20} />
                <input
                  type="number"
                  placeholder="m³"
                  className="bg-transparent w-full outline-none text-gray-800 font-medium"
                  value={form.maxVolume}
                  onChange={(e) =>
                    setForm({ ...form, maxVolume: e.target.value })
                  }
                />
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="group">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
              Pricing Strategy
            </label>
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-100 group-focus-within:border-red-500 group-focus-within:bg-white transition-all">
              <IndianRupee className="text-gray-400 group-focus-within:text-red-500 mr-3" size={20} />
              <input
                type="number"
                placeholder="Rate per km"
                className="bg-transparent w-full outline-none text-gray-800 font-medium"
                value={form.costPerKm}
                onChange={(e) =>
                  setForm({ ...form, costPerKm: e.target.value })
                }
              />
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2
              ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              "Add Truck to Fleet"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}