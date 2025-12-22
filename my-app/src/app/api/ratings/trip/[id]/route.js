import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rating from "@/lib/models/Rating";

export async function GET(req, { params }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const decoded = verifyToken(cookieStore.get("token")?.value);

  await connectDB();

  const rating = await Rating.findOne({
    trip: id,
    from: decoded.userId,
  });

  return NextResponse.json({ rated: !!rating });
}
