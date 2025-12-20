import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Truck from "@/lib/models/Truck";
import Booking from "@/lib/models/Booking";
import Trip from "@/lib/models/Trip";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await connectDB();

    const [trucks, requests, trips] = await Promise.all([
      Truck.countDocuments({ dealer: decoded.userId }),
      Booking.countDocuments({
        dealer: decoded.userId,
        status: "pending",
      }),
      Trip.countDocuments({
        dealer: decoded.userId,
        status: { $ne: "delivered" },
      }),
    ]);

    return NextResponse.json({
      trucks,
      requests,
      trips,
    });
  } catch (err) {
    console.error("Dealer stats error:", err);
    return NextResponse.json(
      { error: "Failed to load dealer stats" },
      { status: 500 }
    );
  }
}
