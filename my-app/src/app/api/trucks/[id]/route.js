import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

import Truck from "@/lib/models/Truck";
import User from "@/lib/models/User"; // model registration
import Rating from "@/lib/models/Rating";

/* =======================
   GET — Public Truck View
   ======================= */
export async function GET(req, { params }) {
  const { id } = await params;

  await connectDB();

  const truck = await Truck.findById(id).populate("dealer", "name");

  if (!truck) {
    return NextResponse.json(
      { error: "Truck not found" },
      { status: 404 }
    );
  }

  const ratings = await Rating.find({
    to: truck.dealer._id,
  });

  const avgRating =
    ratings.length === 0
      ? 0
      : (
          ratings.reduce((a, r) => a + r.score, 0) /
          ratings.length
        ).toFixed(1);

  return NextResponse.json({
    truck,
    dealer: truck.dealer,
    avgRating,
  });
}

/* =========================
   PATCH — Dealer Only Edit
   ========================= */
   export async function PATCH(req, { params }) {
    try {
      const { id } = await params; // ✅ FIX
  
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
  
      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      const decoded = verifyToken(token);
  
      if (decoded.role !== "dealer") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
  
      const body = await req.json();
      await connectDB();
  
      const updatedTruck = await Truck.findOneAndUpdate(
        {
          _id: id, // ✅ USE id
          dealer: new mongoose.Types.ObjectId(decoded.userId),
        },
        {
          $set: {
            number: body.number,
            truckType: body.truckType,
            maxWeight: body.maxWeight,
            maxVolume: body.maxVolume,
            costPerKm: body.costPerKm,
            isAvailable: body.isAvailable,
          },
        },
        { new: true }
      );
  
      if (!updatedTruck) {
        return NextResponse.json(
          { error: "Truck not found or not owned by you" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(updatedTruck);
    } catch (err) {
      console.error("TRUCK PATCH ERROR:", err);
      return NextResponse.json(
        { error: "Failed to update truck" },
        { status: 500 }
      );
    }
  }
  