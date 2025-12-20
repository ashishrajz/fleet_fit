import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = verifyToken(token);

    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
