import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/lib/models/Shipment";
import Truck from "@/lib/models/Truck";
import Rating from "@/lib/models/Rating";

export async function GET(req, { params }) {
  const { id } = await params;

  await connectDB();

  const shipment = await Shipment.findById(id);
  if (!shipment) {
    return NextResponse.json(
      { error: "Shipment not found" },
      { status: 404 }
    );
  }

  const trucks = await Truck.find({ isAvailable: true }).populate(
    "dealer",
    "name"
  );

  const results = await Promise.all(
    trucks.map(async (truck) => {
      const utilization =
        (shipment.volume / truck.maxVolume) * 100;

      if (utilization > 100) return null;

      const ratings = await Rating.find({
        to: truck.dealer._id,
      });

      const avgRating =
        ratings.length === 0
          ? 0
          : ratings.reduce((a, r) => a + r.score, 0) /
            ratings.length;

      return {
        truck,
        dealer: truck.dealer,
        utilization: utilization.toFixed(1),
        costEstimate:
          shipment.distance * truck.costPerKm || 0,
        rating: avgRating.toFixed(1),
      };
    })
  );

  return NextResponse.json(
    results
      .filter(Boolean)
      .sort((a, b) => b.utilization - a.utilization)
  );
}
