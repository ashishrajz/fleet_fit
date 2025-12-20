import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Trip from "@/lib/models/Trip";
import Shipment from "@/lib/models/Shipment";
import Notification from "@/lib/models/Notification";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
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

    const trip = await Trip.findById(id).populate("shipment");

    if (!trip || trip.dealer.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // update trip + shipment
    trip.status = status;
    await trip.save();
    if (status === "delivered") {
  await Truck.findByIdAndUpdate(trip.truck, {
    isAvailable: true,
  });
}


    trip.shipment.status = status;
    await trip.shipment.save();

    // notify warehouse
    await Notification.create({
      user: trip.shipment.warehouse,
      type: "shipment_update",
      message: `Shipment marked as ${status.replace("_", " ")}`,
      relatedId: trip._id,
    });

    return NextResponse.json(trip);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update trip status" },
      { status: 500 }
    );
  }
}
