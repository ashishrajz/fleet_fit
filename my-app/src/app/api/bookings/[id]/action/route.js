import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Booking from "@/lib/models/Booking";
import Trip from "@/lib/models/Trip";
import Truck from "@/lib/models/Truck";
import Notification from "@/lib/models/Notification";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    const cookieStore = await cookies();
    const decoded = verifyToken(cookieStore.get("token")?.value);

    if (decoded.role.toLowerCase() !== "dealer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // ---------------- APPROVE ----------------
    if (action === "approve") {
      // 🔑 CREATE TRIP AND STORE IT
      const trip = await Trip.create({
        shipment: booking.shipment,
        booking: booking._id,
        dealer: booking.dealer,
        warehouse: booking.warehouse, // ✅ FIXED
        truck: booking.truck,
        status: "assigned",
      });

      // mark truck unavailable
      await Truck.findByIdAndUpdate(booking.truck, {
        isAvailable: false,
      });

      // update booking
      booking.status = "approved";
      await booking.save();

      // 🔔 NOTIFY WAREHOUSE
      await Notification.create({
        user: booking.warehouse,
        type: "booking_approved",
        message: "Your shipment has been approved",
        relatedId: trip._id, // ✅ NOW DEFINED
      });

      return NextResponse.json(trip);
    }

    // ---------------- REJECT ----------------
    if (action === "reject") {
      booking.status = "rejected";
      await booking.save();

      await Notification.create({
        user: booking.warehouse,
        type: "booking_rejected",
        message: "Your shipment was rejected",
        relatedId: booking._id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("BOOKING ACTION ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
