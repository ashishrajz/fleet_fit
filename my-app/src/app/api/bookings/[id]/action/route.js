import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Booking from "@/lib/models/Booking";
import Trip from "@/lib/models/Trip";
import Truck from "@/lib/models/Truck";
import Notification from "@/lib/models/Notification";

export async function POST(req, context) {
  try {
    const { id } = await context.params;

    // ✅ READ ACTION (JSON or FORM)
    const contentType = req.headers.get("content-type") || "";
    let action;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      action = body.action;
    } else {
      const formData = await req.formData();
      action = formData.get("action");
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies(); // ✅ FIX (THIS WAS THE BUG)
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
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
      const trip = await Trip.create({
        shipment: booking.shipment,
        booking: booking._id,
        dealer: booking.dealer,
        warehouse: booking.warehouse,
        truck: booking.truck,
        status: "assigned",
      });

      await Truck.findByIdAndUpdate(booking.truck, {
        isAvailable: false,
      });

      // ✅ NO .save() — atomic update
      await Booking.findByIdAndUpdate(
        booking._id,
        { status: "approved" }
      );

      await Notification.create({
        user: booking.warehouse,
        type: "booking_approved",
        message: "Your shipment has been approved",
        relatedId: trip._id,
      });

      return NextResponse.json({ success: true });
    }

    // ---------------- REJECT ----------------
    if (action === "reject") {
      // ✅ NO .save() — atomic update
      await Booking.findByIdAndUpdate(
        booking._id,
        { status: "rejected" }
      );

      await Notification.create({
        user: booking.warehouse,
        type: "booking_rejected",
        message: "Your shipment was rejected",
        relatedId: booking._id,
      });

      return NextResponse.json({ success: true });
    }

  } catch (err) {
    console.error("BOOKING ACTION ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
