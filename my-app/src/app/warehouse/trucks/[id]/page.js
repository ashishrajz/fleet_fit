"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { calculatePrice } from "@/lib/pricing";





import {
  Truck,
  Box,
  Weight,
  IndianRupee,
  Star,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const TRUCK_IMAGES = {
  default:
    "https://images.unsplash.com/photo-1586154684393-27c9e078519e?auto=format&fit=crop&w=1200&q=80",
  "Mini Truck":
    "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&w=1200&q=80",
  Pickup:
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
  Container:
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
  Trailer:
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
};

export default function TruckDetailPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState("idle"); 
  const [distance, setDistance] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [price, setPrice] = useState(0);
  





  useEffect(() => {
    const id = params.id;
    if (!id) return;

    fetch(`/api/trucks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);useEffect(() => {
    const shipmentId = localStorage.getItem("activeShipment");
    if (!shipmentId) return;
  
    const stored = localStorage.getItem(
      `optimizedPrice:${shipmentId}:${params.id}`
    );
  
    if (stored) {
      setPrice(Number(stored));
    }
  }, [params.id]);
  

  useEffect(() => {
    const fetchShipmentDistance = async () => {
      try {
        const shipmentId = localStorage.getItem("activeShipment");
        if (!shipmentId) return;
  
        const res = await fetch(`/api/shipments/${shipmentId}`);
        if (!res.ok) return;
  
        const shipment = await res.json();
        const d = Number(shipment.distance) || 0;
  
        setDistance(d);
      } catch (err) {
        console.error("Failed to fetch shipment distance", err);
      }
    };
  
    fetchShipmentDistance();
  }, []);

  const sendRequest = async () => {
    const shipmentId = localStorage.getItem("activeShipment");
    if (!shipmentId) {
      toast.error("No active shipment selected");
      return;
    }
  
    setRequestStatus("loading");
  
    const utilization = 0; // 🔒 HARD-LOCK (REQUIRED BY MODEL)
  
    const finalPrice = calculatePrice({
      distance,
      costPerKm: data.truck.costPerKm, // ✅ SAFE ACCESS
      utilization,
    });
  
    const res = await fetch("/api/bookings/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentId,
        truckId: data.truck._id,
        distance,
        utilization,
        finalPrice,
      }),
    });
  
    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      toast.error("Booking failed");
      setRequestStatus("idle");
      return;
    }
  
    setRequestStatus("success");
  };
  
  

  if (loading || !data) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const { truck, dealer, avgRating } = data;
 




  
  
  
  



const costPerKm = Number(truck.costPerKm) || 0;
const estimatedPrice = Math.round(distance * costPerKm);
 





  const truckImage = TRUCK_IMAGES[truck.truckType] || TRUCK_IMAGES.default;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="relative h-64 w-full md:h-80 ">
        <img
          src={truckImage}
          alt={truck.truckType}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between md:left-8 md:right-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-slate-800 shadow-md md:h-11 md:w-11">
              {dealer?.name?.[0] ?? "D"}
            </div>
            <div className="hidden text-xs font-medium uppercase tracking-wide text-slate-200 md:block">
              {dealer?.name}
            </div>
          </div>

          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            Verified Vehicle
          </span>
        </div>

        <div className="absolute bottom-6 left-4 max-w-5xl md:left-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white md:text-5xl"
          >
            {truck.truckType}
          </motion.h1>
          <p className="mt-1 text-sm text-slate-200 md:text-base">
            Reliable {truck.truckType} for your next shipment.
          </p>
        </div>
      </div>

      <h1 className="mb-20 ml-20 mt-10 text-3xl font-bold">
        See below for info and ratings
      </h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-8 px-4 md:grid-cols-3 md:px-8"
      >
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <Truck className="text-red-600" size={24} />
              Vehicle Specifications
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <StatIcon
                icon={<Weight size={20} />}
                label="Max Weight"
                value={`${truck.maxWeight} kg`}
                sub="Capacity"
              />
              <StatIcon
                icon={<Box size={20} />}
                label="Max Volume"
                value={`${truck.maxVolume} m³`}
                sub="Space"
              />
              <StatIcon
                icon={<IndianRupee size={20} />}
                label="Rate"
                value={`₹${truck.costPerKm}`}
                sub="Per Km"
              />
            </div>
          </div>

          <Link
            href={`/warehouse/profile/${dealer._id}`}
            className="block w-full"
          >
            <div className="group relative cursor-pointer rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-red-200 hover:shadow-md">
              <div className="absolute right-6 top-6 text-slate-300 transition-colors group-hover:text-red-600">
                <ExternalLink size={20} />
              </div>

              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
                <ShieldCheck className="text-red-600" size={24} />
                Dealer Information
              </h2>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
                    {dealer.name[0]}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-red-700">
                      {dealer.name}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span>{avgRating} Rating</span>
                      </div>
                      <span className="hidden text-slate-400 sm:inline">•</span>
                      <span className="text-slate-500">Verified Dealer</span>
                    </div>
                  </div>
                </div>

                <div className="hidden items-center gap-1 text-sm font-semibold text-slate-400 transition-colors group-hover:text-red-600 md:flex">
                  <span>View Profile</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-red-50 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-medium text-slate-500">
              Estimated Cost
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900">
            ₹ {price.toLocaleString()}


</span>

              <span className="text-sm text-slate-400">/ trip</span>
            </div>

            <div className="my-6 space-y-3 border-t border-dashed border-slate-200 pt-4">
              
              <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>
                ₹ {price.toLocaleString()}

                
</span>

              </div>
            </div>

            <motion.button
              disabled={requestStatus !== "idle"}
              whileHover={requestStatus === "idle" ? { scale: 1.02 } : {}}
              whileTap={requestStatus === "idle" ? { scale: 0.98 } : {}}
              onClick={sendRequest}
              className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-white shadow-md transition-all ${
                requestStatus === "success"
                  ? "bg-green-600 shadow-green-200"
                  : requestStatus === "loading"
                  ? "bg-red-400 cursor-wait"
                  : "bg-red-600 shadow-red-200 hover:bg-red-700 hover:shadow-lg"
              }`}
            >
              {requestStatus === "loading" ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="font-semibold">Processing...</span>
                </>
              ) : requestStatus === "success" ? (
                <>
                  <CheckCircle2 size={18} />
                  <span className="font-semibold">Request Sent</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Request Booking</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </motion.button>

            <p className="mt-4 text-center text-xs text-slate-400">
              No payment required until acceptance.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatIcon({ icon, label, value, sub }) {
  return (
    <div className="group flex flex-col items-center rounded-xl bg-slate-50 p-4 text-center transition-colors hover:bg-red-50">
      <div className="mb-3 rounded-full bg-white p-2 text-slate-500 shadow-sm transition-colors group-hover:text-red-600">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}