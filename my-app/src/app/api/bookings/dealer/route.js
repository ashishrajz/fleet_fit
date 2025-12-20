import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    await connectDB();

    const bookings = await Booking.find({
      dealer: decoded.userId,
      status: "pending",
    })
      .populate("shipment")
      .populate("warehouse");

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json([], { status: 401 });
  }
}
