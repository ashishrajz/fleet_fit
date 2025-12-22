import { headers, cookies } from "next/headers";
import { 
  Truck, 
  MapPin, 
  Package, 
  TrendingUp, 
  Leaf, 
  AlertCircle,
  Calendar,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { FaTruckFast } from "react-icons/fa6";
import { RiGeminiFill } from "react-icons/ri";
import { Link } from "lucide-react";

// --- API Logic ---
async function getDealerStats() {
  const headersList = await headers();
  const cookieStore = await cookies();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/dealer/stats`, {
      cache: "no-store",
      headers: {
        cookie: cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; "),
      },
    });
    if (!res.ok) return { trucks: 0, requests: 0, trips: 0 };
    return res.json();
  } catch (error) {
    return { trucks: 0, requests: 0, trips: 0 };
  }
}



export default async function DealerDashboard() {
  const stats = await getDealerStats();


  const utilizationRate = 78; // % of fleet capacity used
  const co2Saved = stats.co2Saved;

  
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dealer Dashboard</h1>
        
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm">
            Fleet Report
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Add New Truck
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Fleet" 
          value={stats.trucks} 
          icon={Truck} 
          trend="+2 this month"
          color="blue"
        />
        <StatCard 
          label="Active Trips" 
          value={stats.trips} 
          icon={MapPin} 
          subtext="3 arriving soon"
          color="indigo"
        />
        <StatCard 
          label="Pending Requests" 
          value={stats.requests} 
          icon={AlertCircle} 
          highlight={true}
          subtext="Requires Approval"
          color="rose"
        />
        <StatCard 
          label="CO₂ Saved (kg)" 
          value={co2Saved} 
          icon={Leaf} 
          color="emerald"
          trend="Top 10% Dealer"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Fleet Status & Optimization */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Utilization Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Fleet Efficiency</h3>
                <p className="text-slate-500 text-sm">Capacity utilization based on Smart Loading</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">{utilizationRate}% Avg. Load</span>
              </div>
            </div>
            
            {/* Visual Bar Representation of Utilization */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">Heavy Duty Trucks (10T)</span>
                  <span className="text-slate-900">85% Utilized</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-slate-900 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">Medium Duty (5T)</span>
                  <span className="text-slate-900">62% Utilized</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>
          </div>

          

        </div>

        {/* Right Column: Quick Actions & Status */}
        <div className="space-y-6">
          
          {/* Highlight Action Card */}
          <div className="relative isolate pointer-events-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">


            <h3 className="text-lg font-bold mb-2">Driver Availability</h3>
            <p className="text-slate-300 text-sm mb-6">{stats.availableTrucks} drivers are currently idle and ready for assignment.</p>
            <button className="w-full bg-white text-slate-900 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition"> Manage Drivers </button>




          </div>

          {/* Quick Stats List */}
         
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="text-xl shrink-0">
                < RiGeminiFill className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Optimization Tip</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Adding 2 more Medium Duty trucks could increase your match rate by 15% on the Delhi-Mumbai route.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Components ---

function StatCard({ label, value, icon: Icon, highlight = false, subtext, trend, color = "slate" }) {
  const colorMap = {
    slate: "text-slate-600 bg-slate-100",
    blue: "text-blue-600 bg-blue-100",
    indigo: "text-indigo-600 bg-indigo-100",
    rose: "text-rose-600 bg-rose-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-sm transition hover:shadow-md ${highlight ? 'border-rose-100 ring-2 ring-rose-50' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h4 className="text-3xl font-bold text-slate-900 mt-1">{value}</h4>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}

function HealthItem({ label, status }) {
  const isOnline = status === "online";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
        <span className="text-xs text-slate-400 uppercase font-bold">{status}</span>
      </div>
    </div>
  );
}