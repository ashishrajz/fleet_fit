import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

import Truck from "@/lib/models/Truck";
import Booking from "@/lib/models/Booking";
import Trip from "@/lib/models/Trip";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const dealerId = new mongoose.Types.ObjectId(decoded.userId);

    const [
      totalTrucks,
      availableTrucks,
      pendingRequests,
      activeTrips,
      co2Agg,
    ] = await Promise.all([
      Truck.countDocuments({ dealer: dealerId }),

      Truck.countDocuments({
        dealer: dealerId,
        isAvailable: true,
      }),

      Booking.countDocuments({
        dealer: dealerId,
        status: "pending",
      }),

      Trip.countDocuments({
        dealer: dealerId,
        status: { $ne: "delivered" },
      }),

      // 🔥 THIS WAS THE BROKEN PART
      Trip.aggregate([
        {
          $match: {
            dealer: dealerId, // ✅ ObjectId
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$co2Saved" },
          },
        },
      ]),
    ]);

    const co2Saved = co2Agg[0]?.total || 0;
    


    return NextResponse.json({
      trucks: totalTrucks,
      availableTrucks,
      requests: pendingRequests,
      trips: activeTrips,
      co2Saved, // ✅ NOW REAL
    });
  } catch (err) {
    console.error("Dealer stats error:", err);
    return NextResponse.json(
      { error: "Failed to load dealer stats" },
      { status: 500 }
    );
  }
}
