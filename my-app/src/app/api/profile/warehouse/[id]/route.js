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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  /* ---------------- TRIPS ---------------- */
  const trips = await Trip.find({ warehouse: id });

  const completedTrips = trips.filter(t => t.status === "delivered");
  const totalShipments = trips.length;

  /* ---------------- CO₂ (REAL) ---------------- */
  const co2Saved = completedTrips.reduce(
    (sum, t) => sum + (t.co2Saved || 0),
    0
  );

  /* ---------------- DAILY CHART (LAST 30 DAYS) ---------------- */
  const dailyMap = {};
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    dailyMap[key] = 0;
  }

  completedTrips.forEach(trip => {
    const key = new Date(trip.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key] !== undefined) {
      dailyMap[key]++;
    }
  });

  const dailyTrips = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .reverse();

  /* ---------------- RATINGS ---------------- */
  const ratings = await Rating.find({ to: id })
    .populate("from", "name")
    .sort({ createdAt: -1 });

  const avgRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((a, r) => a + r.score, 0) / ratings.length;

  /* ---------------- RESPONSE ---------------- */
  return NextResponse.json({
    user,
    stats: {
      completedTrips: completedTrips.length,
      totalShipments,
      avgRating,
      co2Saved,
    },
    charts: {
      dailyTrips,
    },
    ratings,
  });
}
