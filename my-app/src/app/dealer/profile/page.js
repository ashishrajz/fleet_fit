import { cookies, headers } from "next/headers";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineCharts from "@/components/profile/charts/TripsLineCharts";
import { Leaf, Truck, TrendingUp } from "lucide-react";

async function getProfile() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const meRes = await fetch(`${protocol}://${host}/api/auth/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; "),
    },
  });

  if (!meRes.ok) throw new Error("Not authenticated");
  const me = await meRes.json();

  const profileRes = await fetch(
    `${protocol}://${host}/api/profile/dealer/${me.user._id}`,
    { cache: "no-store" }
  );

  if (!profileRes.ok) throw new Error("Profile not found");
  return profileRes.json();
}

export default async function DealerProfilePage() {
  const data = await getProfile();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* HEADER */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          <ProfileHeader user={data.user} rating={data.stats.avgRating} />
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard
            label="Completed Trips"
            value={data.stats.completedTrips}
            icon={Truck}
          />

          <StatCard
            label="Active Trips"
            value={data.stats.activeTrips}
            icon={TrendingUp}
          />

          <StatCard
            label="Average Rating"
            value={data.stats.avgRating.toFixed(1)}
          />

          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
            <p className="text-emerald-700 text-sm font-bold mb-1 flex items-center gap-1">
              <Leaf className="w-4 h-4" /> CO₂ Saved
            </p>
            <h3 className="text-2xl font-bold text-emerald-900">
              {data.stats.co2Saved || 0} kg
            </h3>
            <p className="text-xs text-emerald-700 mt-2">
              Compared to industry baseline
            </p>
          </div>

        </div>

        {/* CHART + RATINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Monthly Completed Trips
            </h3>
            <div className="h-[320px]">
            <TripsLineCharts data={data.charts.dailyTrips} />

            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">
              Recent Feedback
            </h3>

            {data.ratings.length > 0 ? (
              <RatingList ratings={data.ratings} />
            ) : (
              <p className="text-sm text-slate-400 italic text-center">
                No reviews yet.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
