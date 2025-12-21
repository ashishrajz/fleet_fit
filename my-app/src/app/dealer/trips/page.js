import Link from "next/link";
import { headers, cookies } from "next/headers";
import { 
  MapPin, 
  ArrowRight, 
  Truck, 
  Package, 
  Calendar,
  Building2,
  AlertCircle
} from "lucide-react";

async function getTrips() {
  const headersList = await headers();
  const cookieStore = await cookies();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/trips`, {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

const getStatusStyle = (status) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("completed") || s.includes("delivered")) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (s.includes("transit") || s.includes("active")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (s.includes("pending")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (s.includes("cancelled")) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
};

export default async function DealerTripsPage() {
  const trips = await getTrips();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="w-8 h-8 text-red-500" />
              Active Trips
            </h1>
            <p className="text-gray-500 mt-1">Manage and track your active shipments</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium shadow-sm">
            Total Trips: <span className="text-red-500 font-bold ml-1">{trips.length}</span>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm overflow-hidden">
            <style>{`
              @keyframes drive {
                0% { transform: translateX(-100px); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateX(300px); opacity: 0; }
              }
              .truck-drive {
                animation: drive 3s linear infinite;
              }
            `}</style>
            
            <div className="w-80 h-24 relative mb-6 border-b-2 border-gray-100">
              <div className="absolute bottom-0 left-0 truck-drive">
                <Truck className="w-16 h-16 text-red-500 mb-1" />
                <div className="absolute top-2 -left-4 space-y-1">
                  <div className="w-6 h-1 bg-gray-200 rounded-full" />
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">No trips found</h3>
            <p className="text-gray-500 mt-1 max-w-sm text-center">
              There are currently no active trips associated with your account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((t) => (
              <Link
                key={t._id}
                href={`/dealer/trips/${t._id}`}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Package className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order ID</p>
                      <p className="text-sm font-bold text-gray-900 font-mono">#{t._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(t.status)}`}>
                    {t.status}
                  </span>
                </div>

                <div className="relative py-4 mb-6">
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 border-t-2 border-dashed border-gray-200 -z-10" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center gap-2 bg-white px-2">
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white" />
                      <span className="text-sm font-semibold text-gray-900">{t.shipment.source}</span>
                    </div>

                    <div className="bg-white px-2 text-gray-400 group-hover:text-red-500 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col items-center gap-2 bg-white px-2">
                      <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-50" />
                      <span className="text-sm font-semibold text-gray-900">{t.shipment.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <h1>Order From :</h1>
                        <span className="text-sm truncate max-w-[150px]">
                            {t.warehouse?.name || "Unknown Warehouse"}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-red-500 text-sm font-medium opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Details <ArrowRight className="w-3 h-3" />
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