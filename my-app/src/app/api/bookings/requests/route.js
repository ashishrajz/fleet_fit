import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Shipment from "@/lib/models/Shipment";
import Truck from "@/lib/models/Truck";
import Notification from "@/lib/models/Notification";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    const { shipmentId, truckId } = await req.json();

    await connectDB();

    const shipment = await Shipment.findById(shipmentId);
    const truck = await Truck.findById(truckId).populate("dealer");

    if (!shipment || !truck) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      shipment: shipment._id,
      warehouse: decoded.userId,
      dealer: truck.dealer._id,
      truck: truck._id,
    });

    // Update shipment status
    shipment.status = "requested";
    await shipment.save();

    // Notify dealer
    await Notification.create({
      user: truck.dealer._id,
      type: "booking_request",
      message: "New shipment request received",
      relatedId: booking._id,
    });

    return NextResponse.json(booking);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Booking request failed" },
      { status: 500 }
    );
  }
}
