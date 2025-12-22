import { cookies, headers } from "next/headers";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineChart from "@/components/profile/charts/TripsLineChart";
import { Leaf } from "lucide-react";

async function getWarehouseProfile(id) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/profile/warehouse/${id}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map(c => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  if (!res.ok) throw new Error("Profile not found");
  return res.json();
}

export default async function WarehousePublicProfile({ params }) {
  const { id } = await params;
  const data = await getWarehouseProfile(id);

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <ProfileHeader user={data.user} rating={data.stats.avgRating} />
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Shipments"
            value={data.stats.totalShipments}
          />

          <StatCard
            label="Completed Trips"
            value={data.stats.completedTrips}
          />

          <StatCard
            label="Avg Rating"
            value={data.stats.avgRating.toFixed(1)}
          />

          {/* CO₂ — IMPORTANT FOR PITCH */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
              <Leaf className="w-4 h-4" /> CO₂ Saved
            </p>
            <p className="text-3xl font-bold text-emerald-900 mt-2">
              {data.stats.co2Saved} kg
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              vs industry baseline
            </p>
          </div>
        </div>

        {/* CHART + RATINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* DAILY SHIPMENTS */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 text-slate-800">
              Daily Shipment Activity
            </h3>
            <div className="h-[300px]">
              <TripsLineChart data={data.charts.dailyTrips} />
            </div>
          </div>

          {/* RATINGS */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4 text-slate-800">
              Recent Feedback
            </h3>

            {data.ratings.length > 0 ? (
              <RatingList ratings={data.ratings} />
            ) : (
              <p className="text-sm text-slate-400 italic text-center">
                No ratings yet
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
