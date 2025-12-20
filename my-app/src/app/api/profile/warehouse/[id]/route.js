import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Trip from "@/lib/models/Trip";
import Rating from "@/lib/models/Rating";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();

  /* ---------------- USER ---------------- */
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  /* ---------------- TRIPS ---------------- */
  const trips = await Trip.find({ warehouse: id });

  const completedTrips = trips.filter(
    (t) => t.status === "delivered"
  );
  const activeTrips = trips.filter(
    (t) => t.status !== "delivered"
  );

  /* ---------------- MONTHLY CHART DATA ---------------- */
  const monthlyMap = {};

  trips.forEach((trip) => {
    const date = new Date(trip.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = 0;
    }
    monthlyMap[key]++;
  });

  const monthlyTrips = Object.entries(monthlyMap)
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      return {
        month: `${month}/${year}`,
        trips: count,
      };
    })
    .sort((a, b) => {
      const [m1, y1] = a.month.split("/");
      const [m2, y2] = b.month.split("/");
      return new Date(y1, m1 - 1) - new Date(y2, m2 - 1);
    });

  /* ---------------- RATINGS ---------------- */
  const ratings = await Rating.find({ to: id })
    .populate("from", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  const avgRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((a, r) => a + r.score, 0) /
        ratings.length;

  /* ---------------- RESPONSE ---------------- */
  return NextResponse.json({
    user,
    stats: {
      completedTrips: completedTrips.length,
      activeTrips: activeTrips.length,
      avgRating,
    },
    charts: {
      monthlyTrips, // ✅ THIS FIXES YOUR CRASH
    },
    ratings,
  });
}
