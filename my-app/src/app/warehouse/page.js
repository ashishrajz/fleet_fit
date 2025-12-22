import Link from "next/link";
import { headers, cookies } from "next/headers";
import { 
  Package, 
  MapPin, 
  Calendar, 
  Plus, 
  Truck, 
  ArrowRight, 
  Box, 
  Wind,TrendingUp, Star, Leaf // Added Wind for the animation speed effect
} from "lucide-react";

async function getStats() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/warehouse/stats`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; "),
    },
  });

  if (!res.ok) return null;
  return res.json();
}


async function getShipments() {
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/shipments`, {
      cache: "no-store",
      headers: {
        cookie: cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; "),
      },
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return [];
  }
}

// Helper to style status badges
const getStatusStyles = (status) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s.includes("transit")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("pending")) return "bg-amber-100 text-amber-700 border-amber-200";
  if (s.includes("cancelled")) return "bg-red-100 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default async function WarehouseDashboard() {
  const shipments = await getShipments();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      {/* Inline Styles for the custom Truck Animation */}
      <style>{`
        @keyframes drive-across {
          0% { transform: translateX(-100%) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          25% { transform: translateX(0%) translateY(-1px); }
          50% { transform: translateX(100%) translateY(0); }
          75% { transform: translateX(200%) translateY(-1px); }
          90% { opacity: 1; }
          100% { transform: translateX(350%) translateY(0); opacity: 0; }
        }
        .animate-drive {
          animation: drive-across 4s linear infinite;
        }
      `}</style>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Manage your active logistics and shipments
          </p>
        </div>

        <Link
          href="/warehouse/shipments/new"
          className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Create Shipment
        </Link>
      </div>
      {/* ================= STATS SECTION ================= */}
{stats && (
  <div className="max-w-7xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <TrendingUp className="text-blue-600" />
        <h3 className="font-semibold text-slate-700">Trips Completed</h3>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">
        {stats.tripsCompleted}
      </p>
    </div>

    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Star className="text-amber-500" />
        <h3 className="font-semibold text-slate-700">Avg Rating</h3>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">
        {stats.avgRating ?? "—"}
      </p>
    </div>

    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Leaf className="text-emerald-600" />
        <h3 className="font-semibold text-slate-700">CO₂ Saved</h3>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">
        {stats.co2Saved} kg
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Compared to industry avg utilization
      </p>
    </div>

  </div>
)}
{/* ================================================= */}


      <div className="max-w-7xl mx-auto">
        {shipments.length === 0 ? (
          /* ================= EMPTY STATE ANIMATION ================= */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100 text-center overflow-hidden relative">
            
            {/* Animation Container */}
            <div className="relative w-64 h-24 mb-6">
              {/* The Road */}
              <div className="absolute bottom-0 w-full border-b-2 border-dashed border-slate-200"></div>
              
              {/* Fade Masks (Left and Right) to soften entrance/exit */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10"></div>

              {/* The Moving Truck Group */}
              <div className="absolute bottom-0.5 left-0 animate-drive flex items-end gap-2 text-slate-300">
                <Wind className="w-4 h-4 mb-2 animate-pulse" />
                <Truck className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">No shipments found</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto leading-relaxed">
              The warehouse is quiet. Create a new shipment to get your fleet moving on the road.
            </p>
            
            <Link
              href="/warehouse/shipments/new"
              className="px-6 py-2.5 rounded-lg bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Create your first shipment
            </Link>
          </div>
          /* ======================================================== */
        ) : (
          /* Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipments.map((s) => (
              <Link
                key={s._id}
                href={`/warehouse/shipments/${s._id}`}
                className="group relative bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-100 transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
              >
                {/* Decorative Background Icon */}
                <Box className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 opacity-50 group-hover:opacity-100 group-hover:text-red-50 transition-all duration-500 rotate-12" />

                {/* Card Header: Status & Date */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wider ${getStatusStyles(
                      s.status
                    )}`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                    {s.status}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Route Visualization */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <div className="w-0.5 h-8 bg-slate-200 my-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-50"></div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Source */}
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">From</p>
                        <h3 className="font-semibold text-slate-700 line-clamp-1">{s.source}</h3>
                      </div>
                      
                      {/* Destination */}
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">To</p>
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{s.destination}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                  <p className="text-xs text-slate-400">ID: {s._id.slice(-6)}</p>
                  <div className="flex items-center text-sm font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}