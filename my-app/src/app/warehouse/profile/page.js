import { cookies, headers } from "next/headers";
import Link from "next/link";
import { 
  Truck, 
  Package, 
  Leaf, 
  TrendingUp, 
  Plus, 
  AlertCircle,
  Calendar,
  Settings
} from "lucide-react";

// Existing UI blocks
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineChart from "@/components/profile/charts/TripsLineChart";

// --- BACKEND LOGIC ---
async function getProfile() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    // 1. Get Current User Identity
    const meRes = await fetch(`${protocol}://${host}/api/auth/me`, {
      cache: "no-store",
      headers: {
        cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; "),
      },
    });

    if (!meRes.ok) throw new Error("Auth Failed");
    const me = await meRes.json();

    // 2. Get Warehouse Specific Data
    const profileRes = await fetch(
      `${protocol}://${host}/api/profile/warehouse/${me.user._id}`,
      { cache: "no-store" }
    );

    if (!profileRes.ok) throw new Error("Profile Failed");
    return await profileRes.json();

  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return null; // Return null to handle UI gracefully
  }
}

// --- MAIN PAGE ---
export default async function WarehouseProfilePage() {
  const data = await getProfile();

  // Fallback UI if backend is down or user is new (Prevents demo crashes)
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">System Unavailable</h2>
        <p className="text-slate-500">Please log in again or check your connection.</p>
        <Link href="/auth/login" className="px-6 py-2 bg-slate-900 text-white rounded-md">
          Back to Login
        </Link>
      </div>
    );
  }

  // DERIVED METRICS FOR MVP "WOW" FACTOR
  // Note: If backend doesn't calculate CO2 yet, we estimate it for the demo
  // Logic: 1 Trip = ~120kg CO2 saved compared to unoptimized loads
  const estimatedCO2 = data.stats.co2Saved;
 
  const efficiencyRate = data.stats.totalShipments > 0 
    ? ((data.stats.completedTrips / data.stats.totalShipments) * 100).toFixed(0) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      
      {/* 1. HEADER & ACTION BAR */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 ml-6">Profile</h1>
           
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/settings" 
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
            {/* Primary Action Button - Critical for User Flow */}
            <Link 
              href="shipments/new" 
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Shipment
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* 2. IDENTITY CARD */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-200">
           <ProfileHeader user={data.user} rating={data.stats.avgRating} />
        </div>

        {/* 3. KPI GRID (The "Optimization" Story) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Volume */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="w-16 h-16 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Shipments</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.stats.totalShipments}</h3>
            <p className="text-xs text-blue-600 mt-2 font-medium">Recorded in system</p>
          </div>

          {/* Card 2: Success */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck className="w-16 h-16 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Completed Trips</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.stats.completedTrips}</h3>
            <p className="text-xs text-emerald-600 mt-2 font-medium">
              {efficiencyRate}% Match Rate
            </p>
          </div>

          {/* Card 3: Sustainability (CRITICAL for your pitch) */}
          <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10">
              <Leaf className="w-16 h-16 text-emerald-600" />
            </div>
            <p className="text-emerald-700 text-sm font-bold mb-1 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Est. CO₂ Reduction
            </p>
            <h3 className="text-2xl font-bold text-emerald-900">{estimatedCO2} kg</h3>
            <p className="text-xs text-emerald-700 mt-2">Saved via optimized loading</p>
          </div>

           {/* Card 4: Quality */}
           <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-amber-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Dealer Rating</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.stats.avgRating.toFixed(1)}</h3>
            <p className="text-xs text-amber-600 mt-2 font-medium">Based on recent feedback</p>
          </div>
        </div>

        {/* 4. MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Charts (Takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Monthly Shipment Volume</h3>
                <div className="flex gap-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Volume</span>
                </div>
              </div>
              <div className="h-[320px]">
                 {/* Passing data safely to your existing component */}
                 <TripsLineChart data={data.charts.dailyTrips} />

              </div>
            </div>
          </div>

          {/* Reviews & Notifications (Takes 1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Recent Feedback</h3>
                <Link href="/reviews" className="text-xs text-blue-600 hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                 {/* Reusing your component but ensuring it handles empty states */}
                 {data.ratings && data.ratings.length > 0 ? (
                   <RatingList ratings={data.ratings.slice(0, 3)} /> 
                 ) : (
                   <p className="text-sm text-slate-400 italic py-4 text-center">No reviews received yet.</p>
                 )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}