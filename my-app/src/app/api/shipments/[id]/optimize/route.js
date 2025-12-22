import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/lib/models/Shipment";
import Truck from "@/lib/models/Truck";
import Rating from "@/lib/models/Rating";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();

  /* 1️⃣ Fetch shipment */
  const shipment = await Shipment.findById(id);
  if (!shipment) {
    return NextResponse.json(
      { error: "Shipment not found" },
      { status: 404 }
    );
  }

  const shipmentVolume = Number(shipment.volume);
  const shipmentDistance = Number(shipment.distance);

  /* 2️⃣ Fetch available trucks */
  const trucks = await Truck.find({ isAvailable: true })
    .populate("dealer", "name");

  /* 3️⃣ Fetch ratings ONCE */
  const dealerIds = trucks.map(t => t.dealer._id);

  const ratings = await Rating.find({
    to: { $in: dealerIds }
  });

  const ratingMap = {};
  for (const r of ratings) {
    const key = r.to.toString();
    if (!ratingMap[key]) {
      ratingMap[key] = { sum: 0, count: 0 };
    }
    ratingMap[key].sum += r.score;
    ratingMap[key].count += 1;
  }

  /* 4️⃣ Optimization logic */
  const results = trucks.map(truck => {
    const maxVolume = Number(truck.maxVolume);
    if (!Number.isFinite(maxVolume) || maxVolume <= 0) return null;

    const utilization = (shipmentVolume / maxVolume) * 100;
    if (utilization > 100) return null;

    const dealerRating = ratingMap[truck.dealer._id.toString()] || {
      sum: 0,
      count: 0,
    };

    const avgRating =
      dealerRating.count === 0
        ? 0
        : dealerRating.sum / dealerRating.count;

    return {
      truck,
      dealer: truck.dealer,

      utilization: Number(utilization.toFixed(1)),

      // 🔥 pricing inputs (frontend uses these)
      distance: Number.isFinite(shipmentDistance)
        ? shipmentDistance
        : 0,

      costPerKm: Number(truck.costPerKm) || 0,

      // ⭐ ratings
      rating: Number(avgRating.toFixed(1)),
      ratingCount: dealerRating.count,
    };
  });

  /* 5️⃣ Sort by best utilization */
  return NextResponse.json(
    results
      .filter(Boolean)
      .sort((a, b) => b.utilization - a.utilization)
  );
}
