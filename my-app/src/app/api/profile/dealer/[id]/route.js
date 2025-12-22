import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Trip from "@/lib/models/Trip";
import Rating from "@/lib/models/Rating";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user id" },
        { status: 400 }
      );
    }

    await connectDB();

    /* ---------------- USER ---------------- */
    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /* ---------------- TRIPS ---------------- */
    const trips = await Trip.find({ dealer: id }).lean();

    const completedTrips = trips.filter(
      (t) => t.status === "delivered"
    );

    const activeTrips = trips.filter(
      (t) => t.status !== "delivered"
    );

    /* ---------------- CO₂ ---------------- */
    const co2Saved = completedTrips.reduce(
      (sum, t) => sum + (t.co2Saved || 0),
      0
    );

    /* ---------------- DAILY TRIPS (MATCHES WAREHOUSE SHAPE) ---------------- */
    const dailyMap = {};

    completedTrips.forEach((trip) => {
      const d = new Date(trip.createdAt)
        .toISOString()
        .slice(0, 10); // YYYY-MM-DD

      if (!dailyMap[d]) dailyMap[d] = 0;
      dailyMap[d]++;
    });

    const dailyTrips = Object.entries(dailyMap)
      .map(([day, count]) => ({
        month: day, // 🔥 IMPORTANT: matches TripsLineChart XAxis
        count,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    /* ---------------- RATINGS ---------------- */
    const ratings = await Rating.find({ to: id })
      .populate("from", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const avgRating =
      ratings.length === 0
        ? 0
        : Number(
            (
              ratings.reduce((a, r) => a + r.score, 0) /
              ratings.length
            ).toFixed(1)
          );

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      user,
      stats: {
        completedTrips: completedTrips.length,
        activeTrips: activeTrips.length,
        avgRating,
        co2Saved,
      },
      charts: {
        dailyTrips, // ✅ SAME AS WAREHOUSE
      },
      ratings,
    });

  } catch (err) {
    console.error("DEALER PROFILE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load dealer profile" },
      { status: 500 }
    );
  }
}
