import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Trip from "@/lib/models/Trip";
import Rating from "@/lib/models/Rating";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();

  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const trips = await Trip.find({ dealer: id });

  const completed = trips.filter(t => t.status === "delivered");
  const active = trips.filter(t => t.status !== "delivered");

  const ratings = await Rating.find({ to: id })
    .populate("from", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  const avgRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((a, r) => a + r.score, 0) / ratings.length;

  const monthlyTrips = Object.values(
    completed.reduce((acc, t) => {
      const m = new Date(t.createdAt).toLocaleString("default", { month: "short" });
      acc[m] = acc[m] || { month: m, count: 0 };
      acc[m].count++;
      return acc;
    }, {})
  );

  return NextResponse.json({
    user,
    stats: {
      completedTrips: completed.length,
      activeTrips: active.length,
      avgRating,
    },
    charts: {
      monthlyTrips,
    },
    ratings,
  });
}
