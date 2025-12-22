"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { calculatePrice } from "@/lib/pricing";
import { useRouter } from "next/navigation";


import { 
  Truck, 
  Star, 
  IndianRupee, 
  BarChart3, 
  Send, 
  UserCircle,
  CheckCircle2,
  Loader2,
  ArrowUpRight, // Added for the "See More" interaction
  ShieldCheck,  // Added for trust signal
  Info          // Added for detail context
} from "lucide-react";

export default function OptimizePage() {
  const { id } = useParams(); // shipmentId
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [requesting, setRequesting] = useState(null); 
  const [sentRequests, setSentRequests] = useState([]);

  const router = useRouter();


  useEffect(() => {
    const runOptimization = async () => {
      try {
        const start = Date.now();
        const res = await fetch(
          `/api/shipments/${id}/optimize`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const duration = Date.now() - start;
        if (duration < 1000) await new Promise(r => setTimeout(r, 1000 - duration));

        setResults(data);
      } catch (err) {
        toast.error(err.message || "Optimization failed");
      } finally {
        setLoading(false);
      }
    };

    runOptimization();
  }, [id]);

  const sendRequest = async (truckId, r, price) => {
    setRequesting(truckId);
    try {
      const res = await fetch("/api/bookings/requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: id,
          truckId,
          distance: r.distance,
          utilization: r.utilization,
          finalPrice: price,
        }),
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send request");
      }
  
      toast.success("Booking request sent successfully");
      setSentRequests(prev => [...prev, truckId]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRequesting(null);
    }
  };
  
  
  // --- Loading State (Skeleton) ---
  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
           <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
           <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-[300px] bg-gray-50 rounded-2xl animate-pulse border border-gray-200" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                   <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                   Optimized Matches
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-1">
                 AI analysis found <span className="font-semibold text-gray-900">{results.length} trucks</span> matching your criteria.
              </p>
           </div>
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Truck className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900">No matches found</p>
            <p className="text-gray-500 mt-2 text-sm">Try adjusting your shipment dates or vehicle requirements.</p>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((r) => {
  const isSent = sentRequests.includes(r.truck._id);

  const price = calculatePrice({
    distance: r.distance,
    costPerKm: r.costPerKm,
    utilization: r.utilization,
  });

  // 🔴 ADD THIS LINE — EXACTLY HERE
  const handleTruckClick = () => {
    localStorage.setItem(
      `optimizedPrice:${id}:${r.truck._id}`,
      String(price)
    );
  };

            

            
            return (
              <div
                key={r.truck._id}
                className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                
                {/* --- CLICKABLE CARD AREA (Link) --- */}
                <Link 
  href={`/warehouse/trucks/${r.truck._id}`}
  onClick={() => {
    localStorage.setItem("activeShipment", id);
    handleTruckClick(); // 🔴 ADD THIS
  }}
  className="flex-1 cursor-pointer"
>

                    {/* Top Section: Header & "See More" Icon */}
                    <div className="p-6 pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                {/* Truck Icon Box */}
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                    <Truck className="w-7 h-7 text-gray-700 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 capitalize leading-tight">
                                        {r.truck.truckType}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                                        <UserCircle className="w-4 h-4" />
                                        <span className="font-medium text-gray-600">{r.dealer?.name || "Verified Partner"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* THE "CLICK TO SEE MORE" INTERACTION */}
                            <div className="flex flex-col items-end gap-2">
                                {/* Match Badge */}
                                <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                                   <ShieldCheck className="w-3 h-3" /> 98% Match
                                </div>
                                {/* The Icon */}
                                <div className="p-2 rounded-full text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all transform group-hover:-translate-y-1 group-hover:translate-x-1 duration-300 flex items-center gap-1">
                                    <ArrowUpRight className="w-5 h-5" />
                                    <h1 className="text-blue-500 font-bold ">View details</h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Stats Grid */}
                    <div className="p-6 pt-2">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            {/* Cost - Hero Metric */}
                            <div className="col-span-1">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Est. Cost</p>
                                <div className="flex items-center gap-0.5 text-2xl font-bold text-gray-900">
                                    <IndianRupee className="w-5 h-5 text-gray-400 mt-1" />
                                    {price.toLocaleString("en-IN")}


                                </div>
                            </div>

                            {/* Reliability */}
                            <div className="col-span-1">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Reliability</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 font-bold text-gray-900">
                                        {r.rating} <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
  {r.ratingCount} trips
</span>

                                </div>
                            </div>

                            {/* Utilization Bar */}
                            <div className="col-span-2">
                                 <div className="flex justify-between items-end mb-1.5">
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Capacity Fill</p>
                                    <span className="text-xs font-bold text-gray-700">{r.utilization}%</span>
                                 </div>
                                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${r.utilization > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${r.utilization}%` }}
                                    />
                                 </div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Bottom Section: Action Button */}
                <div className="px-6 pb-6 mt-auto">
                    <button
                      onClick={(e) => {
                          e.stopPropagation(); // Prevent Link click when clicking button
                          if (!isSent) sendRequest(r.truck._id, r, price);

                      }}
                      disabled={isSent || requesting === r.truck._id}
                      className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm
                        ${isSent 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default" 
                            : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5"
                        }
                        ${requesting === r.truck._id ? "opacity-80 cursor-wait" : ""}
                      `}
                    >
                      {requesting === r.truck._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Request...
                          </>
                      ) : isSent ? (
                          <>
                             <CheckCircle2 className="w-4 h-4" />
                             Request Sent
                          </>
                      ) : (
                          <>
                            Send Request <Send className="w-4 h-4" />
                          </>
                      )}
                    </button>
                    
                    {/* Visual Hint text below button on hover */}
                    <div className="h-0 group-hover:h-6 overflow-hidden transition-all duration-300 flex justify-center mt-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Click card to view full truck details
                        </span>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}