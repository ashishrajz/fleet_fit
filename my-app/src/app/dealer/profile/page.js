import { cookies, headers } from "next/headers";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatCard from "@/components/profile/StatCard";
import RatingList from "@/components/profile/RatingList";
import TripsLineChart from "@/components/profile/charts/TripsLineChart";

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
    <div className="p-8 space-y-6">
      <ProfileHeader user={data.user} rating={data.stats.avgRating} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Completed Trips" value={data.stats.completedTrips} />
        <StatCard label="Active Trips" value={data.stats.activeTrips} />
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
