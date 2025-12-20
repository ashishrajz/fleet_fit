import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Shipment from "@/lib/models/Shipment";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const decoded = verifyToken(token);

    const body = await req.json();

    await connectDB();

    const shipment = await Shipment.create({
      ...body,
      warehouse: decoded.userId,
    });

    return NextResponse.json(shipment);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 400 }
    );
  }
}
