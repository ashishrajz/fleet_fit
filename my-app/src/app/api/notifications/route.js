import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 200 });
    }

    const decoded = verifyToken(token);
    await connectDB();

    const notifications = await Notification.find({
      user: decoded.userId,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("NOTIFICATION GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false });
    }

    const decoded = verifyToken(token);
    await connectDB();

    await Notification.updateMany(
      { user: decoded.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("NOTIFICATION PATCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
