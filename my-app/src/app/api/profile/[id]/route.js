import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Trip from "@/lib/models/Trip";
import Rating from "@/lib/models/Rating";

export async function GET(req, { params }) {
  const { id } = await params;

  await connectDB();

  const user = await User.findById(id).select("name role");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const trips = await Trip.find({
    $or: [{ dealer: id }, { warehouse: id }],
    status: "delivered",
  });

  const ratings = await Rating.find({ to: id });

  const avgRating =
    ratings.length === 0
      ? 0
      : (
          ratings.reduce((a, r) => a + r.score, 0) / ratings.length
        ).toFixed(1);

  const totalCO2 = trips.reduce(
    (sum, t) => sum + (t.co2Saved || 0),
    0
  );

  return NextResponse.json({
    user,
    completedTrips: trips.length,
    avgRating,
    totalCO2,
  });
}
