import { cookies, headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Mail, Share2 } from "lucide-react";

import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineCharts from "@/components/profile/charts/TripsLineCharts";

async function getDealerProfile(id) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/profile/dealer/${id}`,
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

  if (!res.ok) throw new Error("Profile not found");
  return res.json();
}

export default async function DealerPublicProfile({ params }) {
  const { id } = await params;
  const data = await getDealerProfile(id);

  const dealerEmail = data.user?.email || "";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/warehouse/dealers"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dealers
          </Link>

          <div className="flex gap-3">
            <a
              href={`mailto:${dealerEmail}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
              <Mail className="w-4 h-4" />
              Contact Dealer
            </a>

            <a
              href={`mailto:?subject=Dealer Profile&body=Check out this dealer on Ascendo`}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
          <ProfileHeader user={data.user} rating={data.stats.avgRating} />
        </div>

        {/* KPI GRID — SAME AS WAREHOUSE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Completed Trips"
            value={data.stats.completedTrips}
          />
          <StatCard
            label="Active Trips"
            value={data.stats.activeTrips}
          />
          <StatCard
            label="Average Rating"
            value={data.stats.avgRating.toFixed(1)}
          />
          <StatCard
            label="Total Trips"
            value={data.stats.completedTrips + data.stats.activeTrips}
          />
        </div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">
              Activity Over Time
            </h3>
          </div>

          <div className="h-[320px]">
            <TripsLineCharts data={data.charts.dailyTrips || data.charts.monthlyTrips} />
          </div>
        </div>

        {/* REVIEWS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Client Reviews</h3>
            <span className="text-xs font-semibold text-slate-500">
              {data.ratings.length} reviews
            </span>
          </div>

          {data.ratings.length === 0 ? (
            <p className="text-slate-400 italic text-center py-8">
              No reviews yet.
            </p>
          ) : (
            <RatingList ratings={data.ratings} />
          )}
        </div>

      </div>
    </div>
  );
}
