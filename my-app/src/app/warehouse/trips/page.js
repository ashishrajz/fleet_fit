import { cookies, headers } from "next/headers";
import Link from "next/link";
import { 
  MapPin, 
  ArrowRight, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock 
} from "lucide-react";

// map status to colors and icons
const getStatusConfig = (status) => {
  const s = status?.toLowerCase() || "";

  if (s.includes("delivered")) {
    return {
      color: "border-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
      label: "Delivered"
    };
  } else if (s.includes("transit") || s.includes("intransit")) {
    return {
      color: "border-blue-500",
      badge: "bg-blue-100 text-blue-700",
      icon: <Truck className="w-4 h-4 text-blue-600" />,
      label: "In Transit"
    };
  } else if (s.includes("pickup") || s.includes("pending")) {
    return {
      color: "border-amber-500",
      badge: "bg-amber-100 text-amber-800",
      icon: <Package className="w-4 h-4 text-amber-600" />,
      label: "Ready for Pickup"
    };
  } else {
    return {
      color: "border-slate-300",
      badge: "bg-slate-100 text-slate-600",
      icon: <Clock className="w-4 h-4 text-slate-500" />,
      label: status || "Unknown"
    };
  }
};

async function getTrips() {
  const cookieStore = await cookies();
  const headersList = await headers();

  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    // grab trips from our internal api
    const res = await fetch(`${protocol}://${host}/api/trips`, {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    });

    if (!res.ok) {
      console.error("Trips fetch failed:", await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
}

export default async function WarehouseTripsPage() {
  const trips = await getTrips();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* internal styles for the float animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Logistics Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your active shipments and trips</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-slate-600 border border-slate-200">
            Total Trips: {trips.length}
          </div>
        </header>

        {trips.length === 0 ? (
          // empty state with float animation
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-slate-50 p-6 rounded-full border border-slate-100 animate-float">
                <Truck className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No active trips</h3>
            <p className="text-slate-500 mt-2 max-w-sm text-center">
              There are no shipments in transit right now. New trips will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const statusConfig = getStatusConfig(trip.status);

              return (
                <Link
                  key={trip._id}
                  href={`/warehouse/trips/${trip._id}`}
                  className={`
                    group relative flex flex-col justify-between
                    bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300
                    border-l-[6px] border-t border-r border-b border-slate-100
                    ${statusConfig.color}
                  `}
                >
                  {/* top section: id and status */}
                  <div className="p-5 border-b border-slate-50 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        #{trip._id.slice(-6)}
                      </span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.badge}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* map visualizer */}
                    <div className="space-y-3">
                      {/* origin */}
                      <div className="flex items-start gap-3">
                        <div className="mt-1 min-w-[20px]">
                          <MapPin className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase">From</p>
                          <p className="text-slate-800 font-semibold line-clamp-1">
                            {trip.shipment?.source || "Unknown Source"}
                          </p>
                        </div>
                      </div>

                      {/* connecting line */}
                      <div className="pl-2.5 -my-1">
                        <div className="w-0.5 h-4 bg-slate-200" />
                      </div>

                      {/* destination */}
                      <div className="flex items-start gap-3">
                        <div className="mt-1 min-w-[20px]">
                          <MapPin className="w-5 h-5 text-indigo-500 fill-indigo-50" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium uppercase">To</p>
                          <p className="text-slate-800 font-semibold line-clamp-1">
                            {trip.shipment?.destination || "Unknown Destination"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* dealer info */}
                  <div className="p-4 bg-slate-50/50 rounded-b-xl flex justify-between items-center mt-auto border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {trip.dealer?.name?.charAt(0) || "D"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Dealer</span>
                        <span className="text-sm font-medium text-slate-700">
                          {trip.dealer?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      <ArrowRight className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}