import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    let token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      token = req.cookies.get("auth_session")?.value || "";
    }

    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // expire immediately
    });

    return response;
  } catch (err: any) {
    console.error("[Auth API] Sign Out Error:", err);
    return NextResponse.json({ success: true });
  }
}
