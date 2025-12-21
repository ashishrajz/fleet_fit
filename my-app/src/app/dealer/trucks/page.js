"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Truck, 
  Weight, 
  Box, 
  IndianRupee, 
  Search,
} from "lucide-react";

const TRUCK_IMAGES = {
  default: "https://images.unsplash.com/photo-1586154684393-27c9e078519e?auto=format&fit=crop&w=800&q=80",
  "Mini Truck": "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=800&q=80",
  "Pickup": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  "Container": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
  "Trailer": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
};

export default function DealerTrucksPage() {
  const [trucks, setTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchTrucks = async () => {
    try {
      const res = await fetch("/api/trucks", { credentials: "include" });
      const data = await res.json();
      setTrucks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const filteredTrucks = trucks.filter(t => 
    filter === "all" ? true : t.truckType === filter
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Fleet Management
            </h1>
            <p className="text-gray-500 mt-2">
              Monitor your vehicle status and logistics in real-time.
            </p>
          </div>

          <Link
            href="/dealer/trucks/new"
            className="group flex items-center gap-2 bg-gray-900 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-gray-200 hover:shadow-red-500/30"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Add New Truck
          </Link>
        </div>

        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="flex gap-2">
            {['all', 'Mini Truck', 'Container', 'Trailer'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === type 
                    ? "bg-red-50 text-red-600" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 text-gray-400">
            <Search size={18} />
            <span className="text-sm">Search fleet...</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredTrucks.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredTrucks.map((t, index) => (
                <TruckCard key={t._id} truck={t} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TruckCard({ truck, index }) {
  const image = TRUCK_IMAGES[truck.truckType] || TRUCK_IMAGES.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          src={image} 
          alt={truck.truckType} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
        
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
            truck.isAvailable 
              ? "bg-green-500/20 border-green-400/30 text-green-100" 
              : "bg-orange-500/20 border-orange-400/30 text-orange-100"
          }`}>
            {truck.isAvailable ? "● Live" : "● Busy"}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">{truck.truckType}</p>
          <h3 className="text-xl font-bold tracking-tight">{truck.number}</h3>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Stat icon={Weight} label="Capacity" value={`${truck.maxWeight} kg`} />
          <Stat icon={Box} label="Volume" value={`${truck.maxVolume} m³`} />
          <Stat icon={IndianRupee} label="Rate" value={`${truck.costPerKm}/km`} />
          <Stat icon={Truck} label="Trips" value="12" />
        </div>

        <Link
          href={`/dealer/trucks/${truck._id}`}
          className="w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-900 font-semibold text-center transition-colors flex items-center justify-center gap-2 text-sm"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-red-50 text-red-500 rounded-lg">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-300 overflow-hidden">
      
      <div className="w-96 h-32 relative mb-6 border-b-2 border-gray-100">
        <motion.div
          animate={{ x: [-150, 400] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 0.5
          }}
          className="absolute bottom-0 left-0"
        >
          <Truck size={64} className="text-red-500 mb-1" />
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute top-2 -left-6 space-y-1"
          >
            <div className="w-6 h-1 bg-gray-200 rounded-full" />
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
            <div className="w-4 h-1 bg-gray-200 rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900">No trucks found</h3>
      <p className="text-gray-500 max-w-sm mt-2 mb-6">
        There are no trucks available in this category. 
        Try changing filters or add a new vehicle.
      </p>
      <Link
        href="/dealer/trucks/new"
        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition"
      >
        Add First Truck
      </Link>
    </div>
  );
}