import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import User from "@/lib/models/User"; // ✅ REQUIRED for populate

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

    const bookings = await Booking.find({
      dealer: decoded.userId,
      status: "pending",
    })
      .populate("shipment", "source destination")
      .populate("warehouse", "name"); // 🔥 NOW WORKS

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("DEALER BOOKINGS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch dealer bookings" },
      { status: 500 }
    );
  }
}
