import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rating from "@/lib/models/Rating";
import Trip from "@/lib/models/Trip";

export async function POST(req) {
  const { tripId, score, comment } = await req.json();

  const cookieStore = await cookies();
  const decoded = verifyToken(cookieStore.get("token")?.value);

  await connectDB();

  const trip = await Trip.findById(tripId);
  if (!trip || trip.status !== "delivered") {
    return NextResponse.json(
      { error: "Trip not eligible for rating" },
      { status: 400 }
    );
  }

  const toUser =
    decoded.role.toLowerCase() === "warehouse"
      ? trip.dealer
      : trip.warehouse;

  // prevent duplicate rating from same user
const existing = await Rating.findOne({
  trip: tripId,
  from: decoded.userId,
});

if (existing) {
  return NextResponse.json(
    { error: "You have already rated this trip" },
    { status: 400 }
  );
}

const rating = await Rating.create({
  trip: tripId,
  from: decoded.userId,
  to: toUser,
  score,
  comment,
});


  return NextResponse.json(rating);
}
