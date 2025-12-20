import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Trip from "@/lib/models/Trip";
import Truck from "@/lib/models/Truck";
import Shipment from "@/lib/models/Shipment";
import User from "@/lib/models/User";
;
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid trip id" },
        { status: 400 }
      );
    }

    await connectDB();

    const trip = await Trip.findById(id)
      .populate("shipment")
      .populate("truck")
      .populate("dealer", "name")
      .populate("warehouse", "name");

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // 🔑 ALWAYS RETURN JSON
    return NextResponse.json(trip);
  } catch (err) {
    console.error("TRIP DETAIL API ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
