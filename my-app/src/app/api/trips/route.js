import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Trip from "@/lib/models/Trip";
import Shipment from "@/lib/models/Shipment";
import User from "@/lib/models/User";
import Truck from "@/lib/models/Truck";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([]);
    }

    // ✅ DEFINE decoded BEFORE USING IT
    const decoded = verifyToken(token);
    const role = decoded.role.toLowerCase();
    const userId = new mongoose.Types.ObjectId(decoded.userId);

    await connectDB();

    let trips = [];

    if (role === "dealer") {
      trips = await Trip.find({ dealer: userId })
        .populate("shipment")
        .populate("truck")
        .populate("dealer", "name")
        .populate("warehouse", "name")
        .sort({ createdAt: -1 });
    }

    if (role === "warehouse") {
      trips = await Trip.find({ warehouse: userId })
        .populate("shipment")
        .populate("truck")
        .populate("dealer", "name")
        .populate("warehouse", "name")
        .sort({ createdAt: -1 });
    }

    console.log("📦 FOUND TRIPS COUNT:", trips.length);
    return NextResponse.json(trips);
  } catch (err) {
    console.error("TRIPS API ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
