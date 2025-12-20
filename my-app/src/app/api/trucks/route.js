import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Truck from "@/lib/models/Truck";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
      return NextResponse.json(
        { error: "Only dealers can add trucks" },
        { status: 403 }
      );
    }

    const body = await req.json();

    await connectDB();

    const truck = await Truck.create({
      ...body,
      dealer: decoded.userId,
      isAvailable: true,
    });

    return NextResponse.json(truck);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to add truck" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = verifyToken(token);

    if (decoded.role !== "dealer") {
      return NextResponse.json([], { status: 403 });
    }

    await connectDB();

    const trucks = await Truck.find({
      dealer: decoded.userId,
    });

    return NextResponse.json(trucks);
  } catch {
    return NextResponse.json([], { status: 401 });
  }
}
