"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Calendar,
  Package,
  ArrowRightLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Map,
  Milestone, // Added icon
} from "lucide-react";
import { cities, getDistance } from "./database"

// --- Mock API Service ---
const fetchCities = async (query) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!query) return [];
  // Use the raw cities array
  return cities.filter((city) =>
    city.name.toLowerCase().includes(query.toLowerCase())
  );
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function NewShipment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState(null);

  const [form, setForm] = useState({
    weight: "",
    volume: "",
    boxes: "",
    source: "",
    sourceAddress: "",
    destination: "",
    destinationAddress: "",
    pickup: "",
    deadline: "",
    instructions: "",
  });

  // --- Calculate Distance Effect ---
  useEffect(() => {
    // Find the full city objects based on the names selected in the form
    const sourceCity = cities.find(c => c.name === form.source);
    const destCity = cities.find(c => c.name === form.destination);

    if (sourceCity && destCity) {
      const dist = getDistance(
        sourceCity.lat, 
        sourceCity.lon, 
        destCity.lat, 
        destCity.lon
      );
      setCalculatedDistance(dist);
    } else {
      setCalculatedDistance(null);
    }
  }, [form.source, form.destination]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCitySelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwapRoute = () => {
    setForm((prev) => ({
      ...prev,
      source: prev.destination,
      destination: prev.source,
      sourceAddress: prev.destinationAddress,
      destinationAddress: prev.sourceAddress,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.source || !form.destination || !form.pickup || !form.deadline) {
      toast.error("Please fill in required fields");
      setLoading(false);
      return;
    }

    const payload = {
      weight: form.weight ? Number(form.weight) : undefined,
      volume: form.volume ? Number(form.volume) : undefined,
      boxes: form.boxes ? Number(form.boxes) : undefined,
      source: form.source,
      destination: form.destination,
      distance: calculatedDistance, // Send calculated distance to backend if needed
      pickup: new Date(form.pickup),
      deadline: new Date(form.deadline),
    };

    try {
      const res = await fetch("/api/shipments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create shipment");

      toast.success("Shipment created successfully");
      router.push(`/warehouse/shipments/${data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="p-2.5 bg-gradient-to-br from-red-100 to-red-50 rounded-xl text-red-600 shadow-sm border border-red-100"
            >
              <Truck className="w-8 h-8" />
            </motion.span>
            Create Shipment
          </h1>
          <p className="mt-2 text-slate-500 ml-16">
            Schedule a new logistic movement.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Route & Dates */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                </div>
                Route & Schedule
              </h2>
              
              {/* Distance Display Badge */}
              <AnimatePresence>
                {calculatedDistance && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-full text-xs font-medium shadow-md"
                  >
                    <Milestone className="w-3.5 h-3.5" />
                    <span>{calculatedDistance} km</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Locations Grid */}
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
              {/* Source Column */}
              <div className="space-y-4">
                <CitySearchInput
                  label="Source City"
                  value={form.source}
                  onChange={(val) => handleCitySelect("source", val)}
                  placeholder="Ex: New Delhi"
                />
                <AddressTextArea
                  label="Pickup Address"
                  name="sourceAddress"
                  value={form.sourceAddress}
                  onChange={handleChange}
                  placeholder="Street, Warehouse No, Landmark..."
                />
              </div>

              {/* Swap Button & Connector */}
              <div className="flex flex-col items-center justify-center h-full pt-8 z-10 gap-2">
                <motion.button
                  type="button"
                  onClick={handleSwapRoute}
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-3 rounded-full bg-white text-slate-600 hover:text-red-600 border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-colors"
                  title="Swap Route"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </motion.button>
                {/* Mobile visible distance */}
                {calculatedDistance && (
                  <span className="sm:hidden text-xs font-bold text-slate-500">
                    {calculatedDistance} km
                  </span>
                )}
              </div>

              {/* Destination Column */}
              <div className="space-y-4">
                <CitySearchInput
                  label="Destination City"
                  value={form.destination}
                  onChange={(val) => handleCitySelect("destination", val)}
                  placeholder="Ex: Mumbai"
                />
                <AddressTextArea
                  label="Delivery Address"
                  name="destinationAddress"
                  value={form.destinationAddress}
                  onChange={handleChange}
                  placeholder="Street, Warehouse No, Landmark..."
                />
              </div>
            </div>

            <div className="my-8 border-t border-slate-100" />

            {/* Dates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomDatePicker
                label="Pickup Date"
                value={form.pickup}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, pickup: date }))
                }
              />
              <CustomDatePicker
                label="Expected Delivery"
                value={form.deadline}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, deadline: date }))
                }
              />
            </div>
          </motion.div>

          {/* Section 2: Load Details & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Load Specs */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <Package className="w-5 h-5 text-red-500" />
                </div>
                Load Specifications
              </h2>

              <div className="space-y-5">
                <NumberInput
                  label="Total Weight"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  unit="kg"
                />
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Volume"
                    name="volume"
                    value={form.volume}
                    onChange={handleChange}
                    unit="m³"
                  />
                  <NumberInput
                    label="Box Count"
                    name="boxes"
                    value={form.boxes}
                    onChange={handleChange}
                    unit="qty"
                  />
                </div>
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 h-full"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                Additional Information
              </h2>

              <div className="h-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Delivery Instructions
                </label>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                  placeholder="E.g. Call before arrival, Gate code 1234, Fragile handling required..."
                />
              </div>
            </motion.div>
          </div>

          {/* Action Area */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-end gap-4 pt-4 pb-12"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Processing..." : "Create Shipment"}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

function CitySearchInput({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && isOpen) {
        setIsLoading(true);
        const cities = await fetchCities(query);
        setResults(cities);
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (city) => {
    setQuery(city);
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-20">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative group">
        <motion.div
          animate={{
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? "#ef4444" : "#94a3b8",
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none"
        >
          <Search className="w-5 h-5" />
        </motion.div>
        <input
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
          placeholder={placeholder}
        />
      </div>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((city, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSelect(city.name)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 text-sm text-slate-700 hover:text-red-700 transition-colors border-b border-slate-50 last:border-0"
                >
                  <span className="font-medium">{city.name}</span>
                </motion.button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">
                No cities found.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddressTextArea({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
            : "0 0 0 0px transparent",
          borderColor: focused ? "#ef4444" : "#e2e8f0",
        }}
        className="relative group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-colors"
      >
        <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
          <Map className="w-5 h-5" />
        </div>
        <textarea
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          className="w-full pl-10 pr-4 py-3 bg-transparent focus:outline-none text-slate-800 text-sm resize-none"
        />
      </motion.div>
    </div>
  );
}

function NumberInput({ label, unit, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
            : "0 0 0 0px transparent",
          borderColor: focused ? "#ef4444" : "#e2e8f0",
        }}
        className="relative group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-colors"
      >
        <input
          type="number"
          step="0.01"
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-4 pr-12 py-3 bg-transparent focus:outline-none font-semibold text-slate-800"
          placeholder="0.00"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
          {unit}
        </div>
      </motion.div>
    </div>
  );
}

function CustomDatePicker({ label, value, onChange }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const displayDate = value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Select Date";

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const offsetDate = new Date(
      selected.getTime() - selected.getTimezoneOffset() * 60000
    );
    onChange(offsetDate.toISOString().split("T")[0]);
    setShowCalendar(false);
  };

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);
    for (let i = 1; i <= totalDays; i++) {
      const isSelected =
        value &&
        new Date(value).getDate() === i &&
        new Date(value).getMonth() === month;
      days.push(
        <motion.button
          key={i}
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDayClick(i)}
          className={`h-9 w-9 rounded-full text-sm font-medium flex items-center justify-center transition-colors
                  ${
                    isSelected
                      ? "bg-red-600 text-white shadow-md"
                      : "hover:bg-red-50 text-slate-700 hover:text-red-600"
                  }
                `}
        >
          {i}
        </motion.button>
      );
    }
    return days;
  };

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <motion.button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        whileTap={{ scale: 0.99 }}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all ${
          showCalendar
            ? "border-red-500 ring-2 ring-red-500/20 bg-white"
            : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
        }`}
      >
        <span
          className={`text-sm font-medium ${
            value ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {displayDate}
        </span>
        <motion.div animate={{ rotate: showCalendar ? 180 : 0 }}>
          <Calendar
            className={`w-5 h-5 ${
              showCalendar ? "text-red-500" : "text-slate-400"
            }`}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl z-50 p-4 w-72"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={prevMonth}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </motion.button>
              <span className="font-bold text-slate-800">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={nextMonth}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </motion.button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["S", "M", "T", "W", "Th", "F", "Sa"].map((d) => (
                <span key={d} className="text-xs font-bold text-slate-400">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}