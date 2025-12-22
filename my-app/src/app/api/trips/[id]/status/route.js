import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Trip from "@/lib/models/Trip";
import Booking from "@/lib/models/Booking";
import Shipment from "@/lib/models/Shipment";
import Truck from "@/lib/models/Truck";
import Notification from "@/lib/models/Notification";

export async function PATCH(req, context) {
  try {
    // ✅ Next.js params fix
    const { id } = await context.params;
    const { status } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
      return NextResponse.json(
        { error: "Only dealer can update trip" },
        { status: 403 }
      );
    }

    await connectDB();

    // 🔥 Populate shipment + booking for CO₂ calc
    const trip = await Trip.findById(id)
      .populate("shipment")
      .populate({
        path: "booking",
        select: "utilization",
      });

    if (!trip || trip.dealer.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // ===============================
    // ✅ CO₂ CALCULATION (ONCE ONLY)
    // ===============================
    if (status === "delivered" && trip.status !== "delivered") {
      const distance = Number(trip.shipment.distance) || 0;

      // Utilization fallback logic
      let utilization = trip.booking?.utilization ?? 50;
      utilization = Math.max(30, Math.min(utilization, 90));

      /*
        Industry baseline:
        - Poor utilization: 1.0 kg/km
        - Optimized (~80%): 0.7 kg/km
      */
      const baselineEmission = distance * 1.0;

      // Linear improvement curve
      const optimizedFactor = 1.0 - (utilization / 100) * 0.375;
      const optimizedEmission = distance * optimizedFactor;

      const co2Saved = Math.max(
        0,
        Math.round(baselineEmission - optimizedEmission)
      );

      trip.co2Saved = co2Saved;

      // 🚚 Free the truck
      await Truck.findByIdAndUpdate(trip.truck, {
        isAvailable: true,
      });
    }

    // ===============================
    // UPDATE TRIP + SHIPMENT STATUS
    // ===============================
    trip.status = status;
    await trip.save();

    trip.shipment.status = status;
    await trip.shipment.save();

    // 🔔 Notify warehouse
    await Notification.create({
      user: trip.shipment.warehouse,
      type: "shipment_update",
      message: `Shipment marked as ${status.replace("_", " ")}`,
      relatedId: trip._id,
    });

    return NextResponse.json(trip);
  } catch (err) {
    console.error("TRIP STATUS UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update trip status" },
      { status: 500 }
    );
  }
}
