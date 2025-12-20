import { cookies, headers } from "next/headers";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineChart from "@/components/profile/charts/TripsLineChart";

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
    <div className="p-8 space-y-6">
      <ProfileHeader user={data.user} rating={data.stats.avgRating} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Shipments" value={data.stats.totalShipments} />
        <StatCard label="Completed Trips" value={data.stats.completedTrips} />
        <StatCard
          label="Average Rating"
          value={data.stats.avgRating.toFixed(1)}
        />
      </div>

      <TripsLineChart data={data.charts.monthlyTrips} />
      <RatingList ratings={data.ratings} />
    </div>
  );
}
