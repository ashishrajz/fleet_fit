import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Booking from "@/lib/models/Booking";
import Shipment from "@/lib/models/Shipment";
import Truck from "@/lib/models/Truck";
import User from "@/lib/models/User";

export async function GET(req, context) {
  try {
    // ✅ NEXT.JS FIX — params IS A PROMISE
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Shipment id missing" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid shipment id" },
        { status: 400 }
      );
    }

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

    // 🔒 Dealer can only see shipment if booking exists
    const booking = await Booking.findOne({
      shipment: new mongoose.Types.ObjectId(id),
      dealer: new mongoose.Types.ObjectId(decoded.userId),
    })
      .populate({
        path: "shipment",
        populate: {
          path: "warehouse",
          select: "name _id",
        },
      })
      .populate({
        path: "truck",
        select: "truckType costPerKm",
      });

    if (!booking) {
      return NextResponse.json(
        { error: "No access to this shipment" },
        { status: 403 }
      );
    }

    // 🔍 DEBUG (leave this for now)
    

    return NextResponse.json({
      shipment: booking.shipment,
      booking: {
        _id: booking._id,
        status: booking.status, // ← MUST BE "pending"
        finalPrice: booking.finalPrice,
        utilization: booking.utilization,
        truck: {
          _id: booking.truck._id,
          truckType: booking.truck.truckType,
          costPerKm: booking.truck.costPerKm,
        },
      },
    });
    
  } catch (err) {
    console.error("DEALER SHIPMENT FETCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch shipment" },
      { status: 500 }
    );
  }
}
