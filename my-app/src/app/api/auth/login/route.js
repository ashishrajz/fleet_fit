import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // Connect to DB
    await connectDB();

    // Find user
    const user = await User.findOne({ email }).select("+password"); // Include password field
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    // Set httpOnly cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Prepare user data (exclude password)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      // Add other fields you need: name, etc.
    };

    
    const res = NextResponse.json({
      message: "Login successful",
      token,        
      user: userData 
    });

   
    res.headers.set("Set-Cookie", cookie);
    
    
    return res;

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
