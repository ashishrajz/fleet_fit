import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Shipment from "@/lib/models/Shipment";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ await
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const decoded = verifyToken(token);

    await connectDB();

    const shipments = await Shipment.find({
      warehouse: decoded.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(shipments);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 401 });
  }
}
