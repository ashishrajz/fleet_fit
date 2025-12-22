import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Trip from "@/lib/models/Trip";
import Rating from "@/lib/models/Rating";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    if (decoded.role !== "warehouse") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectDB();

    const warehouseObjectId = new mongoose.Types.ObjectId(decoded.userId);

    /* 1️⃣ Trips completed */
    const tripsCompleted = await Trip.countDocuments({
      warehouse: warehouseObjectId,
      status: "delivered",
    });

    /* 2️⃣ Total CO₂ saved */
    const co2Agg = await Trip.aggregate([
      {
        $match: {
          warehouse: warehouseObjectId,
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$co2Saved" },
        },
      },
    ]);

    const co2Saved = co2Agg[0]?.total || 0;

    /* 3️⃣ Average rating */
    const ratingAgg = await Rating.aggregate([
      {
        $match: {
          to: warehouseObjectId,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$score" },
        },
      },
    ]);

    const avgRating = ratingAgg.length
      ? Number(ratingAgg[0].avg.toFixed(1))
      : null;

    return NextResponse.json({
      tripsCompleted,
      co2Saved,
      avgRating,
    });
  } catch (err) {
    console.error("WAREHOUSE STATS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
