import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Shipment from "@/lib/models/Shipment";
import User from "@/lib/models/User";
import Truck from "@/lib/models/Truck";


export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { shipmentId } = await req.json();

    await connectDB();

    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Only warehouse owner can optimize
    if (shipment.warehouse.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const trucks = await Truck.find({ isAvailable: true }).populate("dealer");

    // ---- OPTIMIZATION LOGIC (simple but real) ----
    const scored = trucks
      .filter(
        (t) =>
          t.maxWeight >= shipment.weight &&
          t.maxVolume >= shipment.volume
      )
      .map((t) => {
        const utilization =
          (shipment.volume / t.maxVolume) * 100;

        const score =
          0.5 * utilization +
          0.3 * t.dealer.avgRating +
          0.2 * (1 / t.costPerKm);

        return {
          truck: t,
          utilization: utilization.toFixed(2),
          score: score.toFixed(2),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json(scored);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Optimization failed" },
      { status: 500 }
    );
  }
}
