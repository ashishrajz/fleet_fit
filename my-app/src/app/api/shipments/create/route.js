import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Shipment from "@/lib/models/Shipment";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await req.json();

    await connectDB();

    const distance = Number(body.distance);

    if (!Number.isFinite(distance)) {
      return NextResponse.json(
        { error: "Invalid distance value" },
        { status: 400 }
      );
    }

    const shipment = await Shipment.create({
      source: body.source,
      destination: body.destination,
      weight: Number(body.weight),
      volume: Number(body.volume),
      boxes: Number(body.boxes),
      deadline: body.deadline,

      distance, // ✅ GUARANTEED number
      warehouse: decoded.userId,
      status: "created",
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (err) {
    console.error("CREATE SHIPMENT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
