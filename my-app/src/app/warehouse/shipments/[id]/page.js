import Link from "next/link";
import { headers, cookies } from "next/headers";
import { 
  Package, 
  MapPin, 
  Calendar, 
  Box, 
  Milestone,
  ArrowDown // 1. Imported ArrowDown
} from "lucide-react";

import ShipmentMap from "@/components/maps/ShipmentMap";


// Adjust this import path based on where you saved cityDatabase.js
import { cities, getDistance } from "../new/database"; 

async function getShipment(id) {
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/shipments/${id}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  if (!res.ok) throw new Error("Failed to load shipment");
  return res.json();
}

export default async function ShipmentDetail({ params }) {
  const { id } = await params;
  const shipment = await getShipment(id);

  // --- Calculate Distance Logic ---
  let distance = shipment.distance;
  
  if (!distance) {
    const sourceCity = cities.find(c => c.name === shipment.source);
    const destCity = cities.find(c => c.name === shipment.destination);
    
    if (sourceCity && destCity) {
      distance = getDistance(
        sourceCity.lat, 
        sourceCity.lon, 
        destCity.lat, 
        destCity.lon
      );
    }
  }

  return (
    // 2. Added min-h-screen to ensure the container fills the view
    <div className="p-8 max-w-7xl mx-auto min-h-screen relative pb-24"> 
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shipment Overview</h1>
        <p className="text-slate-500 mt-1">
          Track and manage your shipment in real time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Route Card */}
          <div className="bg-white rounded-xl p-6 shadow border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <MapPin className="text-red-600 w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold">Route</h2>
              </div>
              
              {/* Distance Highlight */}
              {distance && (
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg shadow-slate-200">
                  <Milestone className="w-4 h-4 text-red-400" />
                  <span className="font-bold tracking-wide">{distance} km</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
               <div className="flex-1">
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Source</p>
                 <p className="text-lg font-medium text-slate-900">{shipment.source}</p>
               </div>
               
               <div className="flex flex-col items-center">
                 <div className="w-16 h-[2px] bg-slate-200 mb-1"></div>
                 <span className="text-xs text-slate-400">Direct</span>
               </div>

               <div className="flex-1 text-right">
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Destination</p>
                 <p className="text-lg font-medium text-slate-900">{shipment.destination}</p>
               </div>
            </div>
          </div>

          {/* Shipment Info */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-red-600" />
              <h2 className="text-xl font-semibold">Shipment Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-500">Weight</p>
                <p className="font-semibold text-base">{shipment.weight} kg</p>
              </div>

              <div>
                <p className="text-slate-500">Volume</p>
                <p className="font-semibold text-base">{shipment.volume} m³</p>
              </div>

              <div>
                <p className="text-slate-500">Boxes</p>
                <p className="font-semibold text-base">{shipment.boxes}</p>
              </div>

              <div>
                <p className="text-slate-500">Deadline</p>
                <p className="font-semibold text-base">
                  {new Date(shipment.deadline).toDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Shipment Status</h2>

            <ul className="space-y-3">
              {[
                "created",
                "requested",
                "approved",
                "picked",
                "in_transit",
                "delivered",
              ].map((status) => {
                const active = shipment.status === status;
                return (
                  <li
                    key={status}
                    className={`flex items-center gap-3 ${
                      active
                        ? "text-red-600 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${
                        active ? "bg-red-600 ring-4 ring-red-100" : "bg-slate-300"
                      }`}
                    />
                    <span className="capitalize">{status.replace("_", " ")}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CTA */}
          {shipment.status === "created" && (
            <div>
              <Link
                href={`/warehouse/shipments/${shipment._id}/optimize`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/20"
              >
                Find Best Truck
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT: VISUAL */}
        <div className="bg-white rounded-xl shadow overflow-hidden h-fit">
        <div className="border-b border-slate-100">
  <ShipmentMap
    source={shipment.source}
    destination={shipment.destination}
  />
</div>


          <div className="p-6">
            <h3 className="font-semibold mb-2 text-slate-900">Live Tracking</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Real-time GPS tracking will become available once the driver accepts the shipment and begins the journey from <strong>{shipment.source}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. NEW: Fixed Scroll Indicator Arrow */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce pointer-events-none print:hidden">
        <span className="text-[16px] uppercase font-bold tracking-widest text-red-500 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
          Scroll Down
        </span>
        <div className="bg-white p-2 rounded-full shadow-lg shadow-slate-200 border border-red-400">
          <ArrowDown className="w-5 h-5 text-red-600" />
        </div>
      </div>

    </div>
  );
}