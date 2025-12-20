export async function POST() {
    const res = NextResponse.json({ message: "Logged out" });
    res.headers.set(
      "Set-Cookie",
      "token=; HttpOnly; Path=/; Max-Age=0"
    );
    return res;
  }
  