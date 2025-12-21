import Link from "next/link";
import { cookies, headers } from "next/headers";
// 1. Import the Wind icon
import { PackageOpen, Truck, Wind } from "lucide-react"; 
import { Heart } from 'lucide-react';

async function getShipments() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/shipments`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; "),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch shipments");
  }

  return res.json();
}

export default async function WarehouseShipmentsPage() {
  const shipments = await getShipments();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* 2. Updated CSS Animation for a smooth wind flow */}
      <style>{`
        @keyframes wind-flow {
          0% { opacity: 0; transform: translateY(15px) scale(0.8) rotate(-5deg); }
          30% { opacity: 1; transform: translateY(0px) scale(1) rotate(0deg); }
          80% { opacity: 0.8; transform: translateY(-15px) scale(1.05) rotate(5deg); }
          100% { opacity: 0; transform: translateY(-25px) scale(1.1) rotate(10deg); }
        }
        .animate-wind {
          animation: wind-flow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Shipments</h1>
          <p className="text-slate-500 mt-1">
            Manage outgoing inventory and logistics
          </p>
        </div>

        {shipments.length > 0 && (
          <Link
            href="/warehouse/shipments/new"
            className="bg-red-600 hover:bg-red-700 transition-colors text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"
          >
            <Truck size={18} />
            <span>Create Shipment</span>
          </Link>
        )}
      </div>

      {/* LOGICAL EMPTY STATE */}
      {shipments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          
          {/* Icon Container relative for positioning */}
          <div className="relative bg-white p-5 rounded-full shadow-sm mb-6">
            
            {/* Main Box Icon (higher z-index to sit in front) */}
            <PackageOpen className="w-12 h-12 text-slate-400 relative z-10" />

            {/* 3. The Wind Icon with Animation */}
            {/* Positioned absolutely to look like it's coming out of the top */}
            <Heart
               className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 text-slate-300 z-0 animate-wind" 
            />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900">
            No shipments found
          </h3>
          
          <p className="text-slate-500 max-w-md text-center mt-2 mb-8">
            You haven't created any outgoing shipments yet. Create your first shipment to start finding trucks and moving inventory.
          </p>
          
          <Link
            href="/warehouse/shipments/new"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Truck size={20} />
            <span>Create First Shipment</span>
          </Link>
        </div>
      ) : (
        /* Shipments list (unchanged) */
        <div className="grid gap-4">
          {shipments.map((s) => (
            <div
              key={s._id}
              className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-800">
                    {s.source}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-lg font-semibold text-slate-800">
                    {s.destination}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="text-sm text-slate-500">
                    Status:{" "}
                    <span
                      className={`font-medium px-2 py-0.5 rounded-full text-xs uppercase tracking-wide ${
                        s.status === "created"
                          ? "bg-blue-50 text-blue-700"
                          : s.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <p className="text-xs text-slate-400">
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href={`/warehouse/shipments/${s._id}`}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  View Details
                </Link>

                {s.status === "created" && (
                  <Link
                    href={`/warehouse/shipments/${s._id}/optimize`}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    Find Trucks
                  </Link>
                )}

                {s.status !== "created" && s.trip && (
                  <Link
                    href={`/warehouse/trips/${s.trip}`}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition-colors"
                  >
                    Track Trip
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}